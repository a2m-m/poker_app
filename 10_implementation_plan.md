# 10. Implementation Plan（実装タスク分解 / Issue向け）

このドキュメントは、MVPを完成させるための実装タスクを「迷いなく進められる順番」で並べる。
各タスクはGitHub Issueにコピペできる粒度を想定する。

前提：
- 仕様は 01〜09 のドキュメントに従う
- MVPはキャッシュゲーム、サイドポットなし
- HashRouter + GitHub Pagesで配布

---

## 10.1 マイルストーン（MVP）
- M0：プロジェクト雛形が動く（Pagesに出せる）
- M1：Setup→Tableまで到達、静的UIが揃う
- M2：Domainロジックで1ハンド完走（チェック主体）
- M3：Bet/Raise/Fold/All-fold終了まで実装
- M4：Undo、ログ、役一覧、判定ツール（任意）
- M5：永続化（続きから）+ 仕上げ（ガード/警告）

---

## 10.2 タスク一覧（推奨順）

### T00: リポジトリ初期化（Vite + React + TS）
**目的**：ローカルで起動できる雛形を作る  
**作業**
- ViteでReact+TSを作成
- ESLint/Prettier（任意）
- ディレクトリ構成（09章）を作る
**受け入れ条件**
- `npm run dev` が起動し、ブラウザで表示される

---

### T01: ルーティング（HashRouter）と空ページ
**目的**：`/` `/setup` `/table` に遷移できる  
**作業**
- React Router（HashRouter）
- HomePage/SetupPage/TablePage を仮実装
**受け入れ条件**
- 3画面を行き来できる（URLが `/#/setup` 形式）

---

### T02: UI骨格（AppShell / TopBar / UtilityActions）
**目的**：ワイヤーの枠を作る（04, 05, 06準拠）  
**作業**
- AppShell
- TopBar（TableではRound/Pot/SB/BB/BTN）
- UtilityActions（ログ/役/判定/設定の入口だけ）
**受け入れ条件**
- `/table` にTopBarが表示され、ユーティリティがクリック可能（中身は後回し）

---

### T03: Setup画面UI（人数/名前/スタック/SB/BB/ボタン）
**目的**：ゲーム作成に必要な入力UIを揃える  
**作業**
- 人数ステッパー（2〜9）
- プレイヤー入力行（名前、スタック）
- SB/BB入力
- ボタン初期位置（選択 or ランダム）
- バリデーション（短文）
**受け入れ条件**
- 必須項目が揃うと「開始」でき、`/table`へ遷移できる（データは仮でOK）

---

### T04: Domain型定義（types.ts）と初期化（init.ts）
**目的**：08章の型と初期化関数を実装  
**作業**
- `Game`, `Player`, `Table`, `Round`, `Action` 型
- `createGameFromSetup()`（Setup入力→Game生成）
- `startHand()`（HAND_INIT：ブラインド徴収）
- `startRound(round)`（betThisRound/currentBetの初期化 + 手番セット）
**受け入れ条件**
- Setup入力からGameが生成され、Preflop開始まで作れる

---

### T05: Reducer骨格（useReducer + Context）
**目的**：状態更新を一箇所に集約  
**作業**
- GameContext
- actions（GAME_CREATE/HAND_START/ACTION_APPLY等の最低限）
- 画面からdispatchできるようにする
**受け入れ条件**
- Setup→TableでGameStateが渡り、TopBarにRound/Pot等が表示できる

---

### T06: Selectors（toCall / availableActions）
**目的**：UIが参照する計算を固定  
**作業**
- `getCurrentPlayer()`
- `toCall(player)`
- `availableActions(game, player)`
**受け入れ条件**
- 手番に応じてボタンが変わる（Check/Callなど）

---

### T07: ActionPanel / ActionButtons / AmountInput（UI実装）
**目的**：手番入力ができるUIを完成させる  
**作業**
- ActionPanel（手番名/toCall）
- ActionButtons（可能なアクションのみ）
- AmountInput（Bet/Raiseのみ）
**受け入れ条件**
- 手番プレイヤーが「行動を選ぶ→確定」まで行ける（まだ計算は仮でもOK）

---

### T08: applyAction（CHECK/CALL/BET/RAISE/FOLD）+ 次手番
**目的**：チップ計算と手番進行を実装  
**作業**
- 08章に従って applyAction
- 次の手番計算（Foldをスキップ）
- ACTIVEが1人なら即ハンド終了へ
**受け入れ条件**
- Preflopで全員がCall/Checkでき、手番が回る
- ポット/スタック/投入額が矛盾しない

---

### T09: Round Close判定 + Round遷移（Preflop→Flop→…）
**目的**：ベッティングが揃ったら次ラウンドへ進む  
**作業**
- lastAggressorなどを使ってラウンドクローズ判定
- roundAdvance（betThisRound=0, currentBet=0）
- 手番開始位置をラウンド規則に従ってセット
- ガイド文（「フロップを3枚めくってください」等）
**受け入れ条件**
- 1ハンドをRiverまで進められる（カードは物理）

---

### T10: Showdown（勝者選択）→ pot付与 → 次ハンド
**目的**：ハンド終了を成立させる  
**作業**
- Showdown状態で勝者選択UI（最低限：プレイヤー一覧から選ぶ）
- pot付与、pot=0
- buttonIndexを進め、次ハンド初期化
**受け入れ条件**
- 1ハンドが完走し、次ハンドのSB/BB/BTNが更新される

---

### T11: PlayerGrid / PlayerCard（2〜9人対応）
**目的**：卓の状況表示を完成させる  
**作業**
- 3列×最大3行
- バッジ（BTN/SB/BB/TURN/FOLD）
- Stack/Betの表示
**受け入れ条件**
- 2〜9人で破綻せず、手番が一目でわかる

---

### T12: Undo（直前1手）
**目的**：入力ミス救済  
**作業**
- actionHistory（差分）設計
- Undoで逆適用
**受け入れ条件**
- 直前のアクションが戻り、数値矛盾がない

---

### T13: ログ（L1 ActionLogPanel）
**目的**：流れ確認とUndo支援  
**作業**
- entries生成（player/action/amount/round）
- Drawer/Modalで表示
**受け入れ条件**
- 直前アクションが見える

---

### T14: 役一覧（L2 CheatSheet）
**目的**：困ったら参照  
**作業**
- 役の順位の静的表示（日本語）
**受け入れ条件**
- 1タップで開閉できる

---

### T15: 判定ツール（L3 HandJudgeTool）（任意）
**目的**：ショーダウン補助（ゲーム状態は変えない）  
**作業**
- 共有カード入力
- 手札入力
- 判定ロジック（別モジュールに分離推奨）
**受け入れ条件**
- 入力不足時に短文で案内し、判定できる時だけ結果を出す

---

### T16: 永続化（save/load/clear）とホーム「続きから」
**目的**：ブラウザ再読み込みでも再開できる  
**作業**
- localStorage save/load
- schemaVersion付与
- `/`で「続きから」表示
**受け入れ条件**
- 再読み込み後もゲームを再開できる

---

### T17: サイドポット未対応ガード（警告/抑止）
**目的**：未対応で壊れないようにする  
**作業**
- `stack < toCall` などの場面でCALL無効化 or 警告
- blind不足なども同様
**受け入れ条件**
- 矛盾状態（負スタック等）にならない

---

### T18: GitHub Pagesデプロイ（Actions）
**目的**：公開して誰でも触れる  
**作業**
- Pages設定
- GitHub Actionsでbuild→deploy
**受け入れ条件**
- 公開URLで起動できる

---

## 10.3 最小のDone定義（MVP）
- Setup→Table→1ハンド完走→次ハンド開始までできる
- Bet/Raise/Fold/All-fold終了ができる
- Undoが効く
- 役一覧が開ける
- （任意）判定ツールが使える
- GitHub Pagesで動く
