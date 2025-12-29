# 8. Domain / Data Model（状態と計算ルール）

このドキュメントは、MVP実装でブレやすい「状態管理」と「チップ計算」を固定する。
特に、テーブル画面の表示・アクション入力・ラウンド終了判定・ハンド終了判定が一貫することを目的とする。

前提：
- キャッシュゲーム
- 物理カード（アプリはカードを保持しない）
- チップはアプリで管理
- サイドポットなし（MVPでは未対応）

---

## 8.1 状態の階層（State Hierarchy）
- `GameState`：ゲーム全体（セットアップ/進行中など）
- `HandState`：現在ハンドの進行（Preflop〜Showdown）
- `RoundState`：現在ラウンドのベット状況（誰の番・toCall等）
- `UIState`：モーダル開閉、受け渡し画面など（ゲームロジックとは分離）

---

## 8.2 列挙型（Enums）
### ラウンド（ベッティングラウンド）
- `PREFLOP`
- `FLOP`
- `TURN`
- `RIVER`
- `SHOWDOWN`

### プレイヤー状態
- `ACTIVE`：参加中
- `FOLDED`：フォールドして不参加
- `OUT`：スタック0等で一時的に参加不可（MVPではACTIVE/FOLDEDだけでも可）

### アクション
- `CHECK`
- `CALL`
- `BET`
- `RAISE`
- `FOLD`

---

## 8.3 MVPの数値モデル（サイドポット無し）
### 必須の数値
- `stack`：所持チップ（>=0）
- `betThisRound`：当該ラウンドに投入した額（>=0）
- `pot`：ハンド内の合計ポット（>=0）
- `currentBet`：当該ラウンドの最大投入額（= toCall の基準）
- `toCall(player)`：`max(0, currentBet - player.betThisRound)`

### ラウンド開始時の初期化
- `betThisRound` は全員 0 にリセット
- `currentBet` は 0 にリセット
- `pot` はハンド中ずっと維持（ラウンドではリセットしない）

---

## 8.4 不変条件（Invariants：矛盾を許さない）
- `stack >= 0`
- `betThisRound >= 0`
- `pot >= 0`
- `currentBet == max(players[].betThisRound)` （ACTIVEの中で、でもOK）
- `pot == sum(このハンドで各プレイヤーが支払った合計)`  
  ※ 実装上は「アクション適用でpotを加算」し、Undoで巻き戻す

---

## 8.5 位置（BTN/SB/BB）と手番（Turn）
### 位置管理
- `buttonIndex`：players配列上のBTN位置（0..n-1）
- SBは `(buttonIndex + 1) % n`
- BBは `(buttonIndex + 2) % n`
- ハンド終了後：`buttonIndex = (buttonIndex + 1) % n`

### 手番順（サイドポットなし前提の基本）
- Preflop：
  - 最初のアクションは BBの左（= (BB + 1) % n）から開始
- Flop/Turn/River：
  - 最初のアクションは BTNの左（= (buttonIndex + 1) % n）から開始
- Foldしたプレイヤーはスキップする

---

## 8.6 ブラインド徴収（HAND_INIT）
ハンド開始時に以下を自動適用する。

- SBプレイヤー：`payBlind(SB)`
- BBプレイヤー：`payBlind(BB)`

処理：
1. `stack -= blindAmount`
2. `betThisRound += blindAmount`（※Preflopのラウンド投入として扱う）
3. `pot += blindAmount`
4. `currentBet = max(currentBet, betThisRound)`

注意：
- `stack < blindAmount` の場合は **サイドポット非対応のためMVPでは扱いを固定**する必要がある  
  方針（MVP推奨）：
  - Setupで「初期スタックはBBより十分大きい」警告を出す
  - 実プレイではスタック不足を起こさない運用を前提（起きたら例外扱い）

---

## 8.7 アクション適用ルール（Apply Action）
以下では `p` を手番プレイヤーとする。

### CHECK
条件：
- `toCall(p) == 0`
効果：
- 数値変化なし
- 次の手番へ

### CALL
条件：
- `toCall(p) > 0`
- `p.stack >= toCall(p)`（不足する場合はサイドポット扱いになるためMVPでは例外）
効果：
- `delta = toCall(p)`
- `p.stack -= delta`
- `p.betThisRound += delta`
- `pot += delta`
- 次の手番へ

### BET
条件：
- `currentBet == 0`（このラウンドでまだ誰も賭けていない）
- `amount > 0`
- `p.stack >= amount`
効果：
- `p.stack -= amount`
- `p.betThisRound += amount`
- `pot += amount`
- `currentBet = p.betThisRound`
- 次の手番へ（他プレイヤーはtoCallが発生）

### RAISE
条件：
- `currentBet > 0`
- `raiseTo > currentBet`（“最終的にいくらまで入れるか”で表現するのがおすすめ）
- `p.stack >= (raiseTo - p.betThisRound)`
効果：
- `delta = raiseTo - p.betThisRound`
- `p.stack -= delta`
- `p.betThisRound = raiseTo`
- `pot += delta`
- `currentBet = raiseTo`
- 次の手番へ

### FOLD
条件：
- 常に可能（MVP）
効果：
- `p.status = FOLDED`
- 次の手番へ
- ACTIVEが1人になったらハンド即終了（ショーダウン無し）

---

## 8.8 可能アクションの算出（availableActions）
手番プレイヤー `p` に対して、UIが提示するアクションは以下で決める。

- `toCall(p) == 0` のとき：
  - `CHECK` は可能
  - `BET` は可能（amount入力）
- `toCall(p) > 0` のとき：
  - `CALL` は可能（ただし `p.stack >= toCall` の場合）
  - `RAISE` は可能（スタックが十分ある場合）
- `FOLD` は常に可能
- 不足でサイドポットが必要になる状況（`p.stack < toCall`）は、MVPではUIで抑止（CALL無効化）し警告するか、例外運用に誘導する

---

## 8.9 ラウンド終了判定（Round Close）
ラウンドは以下を満たすと終了する。

- 条件A：ACTIVEが1人（即ハンド終了）
- 条件B：ACTIVEな全員が `betThisRound == currentBet` で揃っている  
  かつ「直近のベット/レイズに対する応答が完了している」

実装メモ（簡易でOK）：
- 「最後にアグレッサー（最後にBet/Raiseした人）」を記録し、
  その人の次から回り、再びアグレッサーに戻ってきたらラウンドクローズ、という方式が実装しやすい

---

## 8.10 ラウンド遷移（Next Round）
- PREFLOP → FLOP → TURN → RIVER → SHOWDOWN
- 次ラウンドに入るとき：
  - 全員の `betThisRound = 0`
  - `currentBet = 0`
  - 手番開始位置をラウンド規則に従ってセット（8.5参照）

---

## 8.11 ショーダウンと配当（MVP）
MVPでは、カードをアプリが保持しないため、**勝者選択は手動**が基本。

- Showdownで：
  - UIで勝者（1人）を選択 → `winner.stack += pot`、`pot = 0`
  - 同点（スプリット）対応は将来拡張でもOK（入れるなら割り切りルールが必要）

判定ツール（任意）はUI補助であり、ゲーム状態を書き換えない（結果を見て人が勝者を選ぶ）。

---

## 8.12 Undo（1手戻し）設計
MVPは「直前の1アクション」を戻せれば良い。

推奨実装：
- `actionHistory[]` に差分（delta）を積む
- Undoで最後の差分を逆適用する  
  例：`stackDelta`, `betDelta`, `potDelta`, `statusChange`, `turnIndexChange`, `currentBetChange` など

受け入れ条件：
- Undo後に Invariants（8.4）が常に成立する

---

## 8.13 TypeScript型（叩き台）
Codexがそのまま実装に使えるよう、最小の型案を示す。

```ts
export type Round = "PREFLOP" | "FLOP" | "TURN" | "RIVER" | "SHOWDOWN";
export type PlayerStatus = "ACTIVE" | "FOLDED";
export type ActionType = "CHECK" | "CALL" | "BET" | "RAISE" | "FOLD";

export type Player = {
  id: string;
  name: string;
  stack: number;        // >=0
  betThisRound: number; // >=0
  status: PlayerStatus;
};

export type Table = {
  pot: number;        // >=0
  round: Round;
  sb: number;
  bb: number;
  buttonIndex: number; // 0..n-1
  currentBet: number;  // max betThisRound in current round
  currentPlayerId: string;
  lastAggressorId?: string; // round close判定の補助
};

export type Game = {
  players: Player[];
  table: Table;
  // UI state is separated (modal open etc.)
};

export type Action = {
  type: ActionType;
  // BET/RAISEの金額表現は "raiseTo" を推奨
  amount?: number;   // BET amount
  raiseTo?: number;  // RAISE target total betThisRound
};
```

---

## 8.14 受け入れ条件（データモデル観点）
- `toCall` / `currentBet` / `pot` / `stack` が常に矛盾しない
- Preflopとそれ以降で手番開始位置が正しい
- FoldでACTIVEが1人になったら即終了できる
- Undoで状態が正しく戻る
