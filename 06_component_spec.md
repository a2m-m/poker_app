# 6. Component Spec（UIコンポーネント仕様）

このドキュメントは、実装AI（Codex）がUIを組むときに迷わないための **コンポーネント仕様書**。
見た目の好みではなく、**役割・入力/出力・状態・禁止事項**を固定する。

前提：
- 端末は **横持ち**
- MVPは **キャッシュゲーム / サイドポットなし**
- 画面構成は「03_ia_navigation.md」「04_wireframe_layout_spec.md」に従う
- UIスタイル規約は「05_ui_style_guide.md」に従う

---

## 6.1 コンポーネント命名規約（推奨）
- 画面（Route）: `HomePage`, `SetupPage`, `TablePage`
- レイアウト: `AppShell`, `TopBar`, `ActionPanel`
- UI部品: `PrimaryButton`, `Badge`, `PlayerCard` など
- モーダル/ドロワー: `Modal`, `Drawer`, `ConfirmDialog`

---

## 6.2 データ依存の前提（UIが参照する最小データ）
この段階では詳細スキーマは「8) Domain / Data Model」で確定するが、UI側が読むべき最低限の概念をここで固定する。

- `players[]`：
  - `id`, `name`
  - `stack`（所持チップ）
  - `betThisRound`（当該ラウンド投入額）
  - `status`（ACTIVE / FOLDED など）
  - `positionBadges`（BTN/SB/BB/TURN など）
- `table`：
  - `pot`
  - `round`（PREFLOP/FLOP/TURN/RIVER/SHOWDOWN）
  - `toCall`（手番プレイヤーがコールする額）
  - `minRaise`（必要なら）
- `turn`：
  - `currentPlayerId`
  - `availableActions[]`（CHECK/CALL/BET/RAISE/FOLD のうち可能なもの）
- `ui`：
  - `isTurnGateOpen`（受け渡し画面の有無）
  - `activeOverlay`（モーダル/ドロワー種別）

---

## 6.3 コンポーネント一覧（MVP）
### コア（テーブル画面）
- `AppShell`
- `TopBar`
- `UtilityActions`（ログ/役/判定/設定の入口）
- `PlayerGrid`
- `PlayerCard`
- `Badge`
- `ActionPanel`
- `ActionButtons`
- `AmountInput`
- `TurnGateOverlay`（受け渡し画面：オプション）
- `InlineAlert`（警告・バリデーション短文）

### セットアップ画面
- `SetupForm`
- `Stepper`（人数など）
- `PlayerEditorRow`
- `TextField`
- `NumberField`
- `PrimaryButton` / `SecondaryButton`

### 別レイヤー（モーダル/ドロワー）
- `Modal`
- `Drawer`
- `ConfirmDialog`
- `ActionLogPanel`
- `HandRankCheatSheet`
- `HandJudgeTool`（判定ツール）

---

# 6.4 コンポーネント仕様

以下、各コンポーネントは「役割 / 使う場所 / 入力（Props） / 出力（Events） / 状態 / UIルール / 受け入れ条件」を記載する。

---

## 6.4.1 AppShell
**役割**：画面の外枠。上部TopBarとメイン領域を確実に配置する。

- 使う場所：全Route
- Props（例）：
  - `topBar: ReactNode`
  - `children: ReactNode`
- UIルール：
  - 主要情報が常に上（TopBar）に来る
  - Safe area / 余白は一元管理
- 受け入れ条件：
  - どのRouteでもTopBarの高さが安定している

---

## 6.4.2 TopBar
**役割**：テーブル状況の常時表示。テーブル画面では最重要。

- 使う場所：`/table`（必須）、他は簡略版でもOK
- 表示（テーブル画面）：
  - Round（PREFLOP/FLOP/TURN/RIVER/SHOWDOWN）
  - Pot
  - SB/BB
  - Button位置（BTNが誰か）
  - UtilityActions（ログ/役/判定/設定）
- Props（例）：
  - `round`, `pot`, `sb`, `bb`, `buttonPlayerName`
  - `onOpenLog`, `onOpenCheatSheet`, `onOpenJudge`, `onOpenSettings`
- UIルール：
  - 数値は桁が増えてもレイアウトが崩れない（折返し/縮小の方針を持つ）
- 受け入れ条件：
  - 重要情報が一行で読める（詰まりすぎない）

---

## 6.4.3 UtilityActions
**役割**：別レイヤーを開く入口。テーブル画面で固定位置に置く。

- 使う場所：`TopBar` 内
- ボタン：
  - ログ / 役 / 判定 / 設定
- UIルール：
  - アイコン＋短いラベル（どちらかだけにしない）
  - 押したら必ず何かが開く（無反応を作らない）
- 受け入れ条件：
  - 1タップで役一覧が開ける

---

## 6.4.4 PlayerGrid
**役割**：2〜9人の`PlayerCard`を破綻なく並べる。

- 使う場所：`/table`
- Props（例）：
  - `players[]`
  - `currentPlayerId`
- UIルール：
  - 基本は3列×最大3行（人数が少なくても3列維持でOK）
  - カードの高さが極端に変わらない
- 受け入れ条件：
  - 2人でも9人でも情報が読めるサイズで配置される

---

## 6.4.5 PlayerCard
**役割**：プレイヤー状態を最小情報で提示。

- 使う場所：`PlayerGrid`
- 表示（必須）：
  - `name`
  - バッジ（BTN/SB/BB/TURN/FOLD）
  - `stack`
  - `betThisRound`
- Props（例）：
  - `name`, `stack`, `betThisRound`
  - `badges: string[]`
  - `isTurn: boolean`, `isFolded: boolean`
- UIルール：
  - 手番は最強調（枠/背景＋TURNバッジ）
  - Foldは非アクティブ化（薄く＋FOLDバッジ）
  - クリック/タップで詳細を出す場合はMVPでは不要（将来拡張）
- 受け入れ条件：
  - 色に頼らず「手番」「Fold」「SB/BB/BTN」が判別できる

---

## 6.4.6 Badge
**役割**：短い状態ラベル（BTN/SB/BB/TURN/FOLD等）を表示。

- 使う場所：`PlayerCard` 他
- Props（例）：
  - `label: "BTN" | "SB" | "BB" | "TURN" | "FOLD" | string`
  - `variant: "default" | "accent" | "muted" | "danger"`
- UIルール：
  - 文字は必須（アイコンのみ禁止）
  - 長文を入れない（短いラベルだけ）
- 受け入れ条件：
  - どのバッジも視認できるサイズ

---

## 6.4.7 ActionPanel
**役割**：手番プレイヤーの入力を集約する（テーブル進行の心臓）。

- 使う場所：`/table`
- 表示（必須）：
  - 「〇〇さんの番です」
  - `toCall`（強調）
  - （任意）`minRaise`
- 内包：
  - `ActionButtons`
  - `AmountInput`（Bet/Raise時）
  - `Undo`ボタン（常に近く）
- Props（例）：
  - `currentPlayerName`
  - `toCall`, `minRaise?`
  - `availableActions[]`
  - `onActionSelect(action)`
  - `onUndo()`
- UIルール：
  - 不可能アクションは非表示 or disabled（理由は短文）
  - 金額が必要なときだけ`AmountInput`を出す
- 受け入れ条件：
  - 手番プレイヤーが迷わず1アクション確定できる

---

## 6.4.8 ActionButtons
**役割**：Check/Call/Bet/Raise/Foldの大ボタン群。

- 使う場所：`ActionPanel`
- Props（例）：
  - `availableActions[]`
  - `onSelect(action)`
- UIルール：
  - ボタンは大きく、ラベルは短く明確（英語/日本語はプロジェクトで統一）
  - Foldは誤タップしないように配置・表現を工夫（端に置く、確認を挟む等）
- 受け入れ条件：
  - 可能な選択肢だけが提示される

---

## 6.4.9 AmountInput
**役割**：Bet/Raiseの金額入力（最短導線）。

- 使う場所：`ActionPanel`
- Props（例）：
  - `value`
  - `min?`, `max?`
  - `onChange(value)`
  - `onConfirm()`
  - `onCancel()`
- UIルール：
  - 数値入力をしやすくする（テンキー想定）
  - バリデーションは短文（例：「最小はXX」）
  - ConfirmはPrimary、CancelはSecondary
- 受け入れ条件：
  - 不正値（負数/NaNなど）で確定できない

---

## 6.4.10 TurnGateOverlay（オプション）
**役割**：端末受け渡し時の誤タップ防止。次の人が「ターン開始」を押すまで入力をロックする。

- 使う場所：`/table`
- Props（例）：
  - `nextPlayerName`
  - `isOpen`
  - `onStartTurn()`
- UIルール：
  - 1画面1目的（次の人に渡す）
  - 大きいボタン1つ（ターン開始）
- 受け入れ条件：
  - `isOpen=true` の間、アクション入力ができない

---

## 6.4.11 Modal / Drawer（共通）
**役割**：テーブル画面を汚さずに詳細を表示。

- 使う場所：ログ/役/判定/設定
- Props（例）：
  - `isOpen`, `title`, `onClose`
  - `children`
- UIルール：
  - 閉じる導線が常に見える
  - 閉じたら必ず`/table`に戻る（Routeは変えない）
- 受け入れ条件：
  - どの別レイヤーも1タップで閉じられる

---

## 6.4.12 ConfirmDialog
**役割**：破壊的操作の確認。

- 使う場所：ハンドリセット、ゲーム終了、保存破棄など
- Props（例）：
  - `title`, `message`
  - `confirmLabel`, `cancelLabel`
  - `onConfirm`, `onCancel`
- UIルール：
  - 選択肢は2つだけ（実行/キャンセル）
  - 説明は短く（長文禁止）
- 受け入れ条件：
  - 破壊的操作はConfirmDialogなしで実行されない

---

## 6.4.13 ActionLogPanel（L1）
**役割**：直前の流れ確認（Undoの判断材料）。

- 使う場所：Drawer/Modal
- 表示：
  - 時系列：`プレイヤー名 + アクション + 金額 + ラウンド`
- Props（例）：
  - `entries[]`
- UIルール：
  - 直近が見やすい（新しいものが上でも下でも統一）
- 受け入れ条件：
  - 直前のアクションが1秒で確認できる

---

## 6.4.14 HandRankCheatSheet（L2）
**役割**：役の一覧（困ったら開く）。

- 使う場所：Modal
- 表示：
  - 役の順位（例付き）
- UIルール：
  - 長文の説明ではなく、短い例と一覧中心
- 受け入れ条件：
  - 1タップで開けて、すぐ閉じられる

---

## 6.4.15 HandJudgeTool（L3）
**役割**：ショーダウン判定（任意入力）。

- 使う場所：Modal
- 入力：
  - 共有カード（0〜5）
  - プレイヤー選択 → 手札2枚
- 出力：
  - 各プレイヤーの役名（任意）
  - 勝者（同点含む）
- UIルール：
  - 通常進行を邪魔しない（任意ツール）
  - 入力補助（カード選択UI）は簡潔に（MVPでは最短優先）
- 受け入れ条件：
  - 入力が不足している場合は判定せず、必要項目を短文で提示する

---

## 6.4.16 InlineAlert
**役割**：バリデーション/警告を短く提示。

- 使う場所：Setupのフッター、AmountInputの下、サイドポット未対応警告など
- UIルール：
  - 1〜2行で収める（長文禁止）
- 受け入れ条件：
  - ユーザーが次の行動を迷わない文面になっている

---

## 6.5 禁止事項（コンポーネント設計の地雷）
- `PlayerCard` に詳細情報を詰め込まない（詳細はログへ）
- 役一覧や判定ツールを常時表示しない（別レイヤー固定）
- 押せないボタンを“押せそうに”見せない（disabledの表現は明確に）
- 破壊的操作をConfirmDialogなしで実行しない

---

## 6.6 受け入れ条件（コンポーネント観点）
- 2〜9人で`PlayerGrid`が破綻しない
- 手番/ポット/to call が一目で分かる
- アクションは常に「可能なものだけ」が表示される
- モーダル/ドロワーは必ず閉じられてテーブルに戻る
