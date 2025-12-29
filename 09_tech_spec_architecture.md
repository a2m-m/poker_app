# 9. Tech Spec / Architecture（実装方針）

このドキュメントは、実装AI（Codex）が「何をどう作るか」を迷わないように、技術選定と構成を固定する。
GitHub Pagesで配布でき、タブレット1台でオフライン寄りに動作することを目指す。

---

## 9.1 前提 / 非機能要件
- 配布：GitHub Pages（静的ホスティング）
- 実行環境：モダンブラウザ（iPad/Androidタブレット想定）
- 端末：横持ち固定を前提（UI側で対応）
- ネットワーク：基本は不要（ローカル完結）。ただし初回アクセスは必要
- 保存：ローカル（localStorage / IndexedDB）
- MVPはアカウント・同期なし
- サイドポット非対応（例外は警告/抑止）

---

## 9.2 技術スタック（推奨・固定）
### フロントエンド
- TypeScript
- React
- Vite（ビルド/開発サーバ）
- CSS：どちらでもOKだが、MVPは実装速度重視で以下のどちらか：
  - Tailwind CSS（ユーティリティで速い）
  - もしくは CSS Modules（好みで）
※ Codexが実装しやすい方を採用（推奨：Tailwind）

### ルーティング
- React Router（HashRouter推奨）
  - GitHub Pagesはパス直叩きが弱いので **HashRouter** が安全
  - routes: `/` `/setup` `/table`（実際は `/#/setup` など）

### 状態管理
- MVPは「外部ライブラリ最小」推奨
  - `useReducer` + Context で `GameState` を集中管理
  - Undoや履歴が必要なため reducer中心が相性良い
- 代替：Zustand等も可（ただしまずはuseReducerで十分）

### 永続化
- localStorage（MVP）
  - 保存頻度：状態更新のたびに保存（軽いサイズに保つ）
  - バージョニング：`schemaVersion` を付けて将来移行できるようにする

---

## 9.3 アプリ構成（高レベル）
- UI（React components）
- Domain（ルール・計算：アクション適用、availableActions、ラウンド終了判定）
- Persistence（save/load）
- Router（ページ遷移）

重要：**Domain層はUIから独立**させる  
（テスト可能にする＆ロジックの迷走を防ぐ）

---

## 9.4 ディレクトリ構成（推奨）
```
/src
  /app
    router.tsx
    AppShell.tsx
  /pages
    HomePage.tsx
    SetupPage.tsx
    TablePage.tsx
  /components
    TopBar.tsx
    PlayerGrid.tsx
    PlayerCard.tsx
    ActionPanel.tsx
    Modal.tsx
    Drawer.tsx
    ConfirmDialog.tsx
    ...
  /domain
    types.ts
    reducer.ts
    actions.ts           // applyActionなど
    selectors.ts         // toCall, availableActionsなど
    rules.ts             // round close判定, next turnなど
    init.ts              // game/hand/round初期化
    undo.ts              // history差分
  /persistence
    storage.ts           // save/load/clear
  /utils
    id.ts
    clamp.ts
  main.tsx
```

---

## 9.5 Domain実装方針（迷いを減らす）
- `Game`（8章のデータモデル）を唯一の真実として保持
- UIは `selectors` で必要値を計算して表示する
- UIから直接 `stack` や `pot` をいじらない  
  → 必ず `dispatch({type: ...})` を通す

推奨のReducerイベント（例）：
- `GAME_CREATE`（setup確定）
- `HAND_START`（ブラインド徴収含む）
- `ACTION_APPLY`（CHECK/CALL/BET/RAISE/FOLD）
- `ROUND_ADVANCE`（Flop/Turn/Riverへ）
- `HAND_AWARD_POT`（勝者へ付与）
- `UNDO`
- `GAME_RESET` / `HAND_RESET`

---

## 9.6 永続化仕様（MVP）
- 保存キー例：`poker-dealer-assist::game`
- 保存内容：`Game` + `schemaVersion` + `savedAt`
- タイミング：
  - `/table`に入ったら自動保存開始
  - 状態更新ごとに保存（reducer後に副作用で保存）
- `/` の「続きから」は保存データがある時だけ表示

---

## 9.7 例外・エラー処理（MVP）
- localStorageが壊れている/読めない：
  - 例外を握りつぶさず、ユーザーに「保存データが読めません。新規開始します。」を表示し、クリアできる導線を用意
- サイドポットが必要になる状況：
  - 可能ならアクション抑止（CALL不可など）
  - 不可能なら警告を表示（例外運用へ）
- 数値入力エラー：
  - `AmountInput` でバリデーション、確定ボタン無効化

---

## 9.8 テスト方針（最低限）
MVPはUIテストより **ドメインロジックのテスト優先**。

- Unitテスト（推奨）
  - `applyAction`
  - `availableActions`
  - `roundClose` 判定
  - `handStart`（ブラインド徴収）
  - `undo` の巻き戻し
- ツール例：Vitest

※ テストは必須ではないが、ロジックが壊れやすいので最低限入れる価値が高い

---

## 9.9 GitHub Pages デプロイ
- Viteのbuild成果物をGitHub Pagesへ
- ルーティングはHashRouterを使う（パス問題回避）

推奨：
- GitHub Actionsで `npm ci` → `npm run build` → Pagesへデプロイ

---

## 9.10 パフォーマンス / 体験（MVP）
- 1卓（最大9人）なので基本的に軽い
- ただし「状態更新→描画」が頻繁なので、以下を守る：
  - stateは1箇所（context+reducer）
  - selectorsで計算
  - 不要な再レンダリングを避ける（memo等は必要なら）

---

## 9.11 受け入れ条件（Tech観点）
- GitHub Pagesで動く（HashRouter）
- ブラウザの再読み込み後も「続きから」で再開できる（localStorage）
- DomainロジックがUIと分離されている（applyAction等が独立関数）
- Undoが安定して動く（状態矛盾が起きない）
