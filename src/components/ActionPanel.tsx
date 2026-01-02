import { useMemo, useState } from 'react'
import { useGameState } from '../app/GameContext.tsx'
import { availableActions, getCurrentPlayer, toCall } from '../domain/selectors.ts'
import type { Action, ActionType } from '../domain/types.ts'
import ActionButtons from './ActionButtons.tsx'
import AmountInput from './AmountInput.tsx'

type ActionPanelProps = {
  onAction?: (action: Action) => void
}

const ACTION_HINT: Record<ActionType, string> = {
  CHECK: 'チェックで次の手番へ',
  CALL: '差額をコールします',
  BET: '新しくベットします',
  RAISE: '現在のベットを引き上げます',
  FOLD: 'このハンドをフォールドします',
}

const ACTION_LABEL: Record<ActionType, string> = {
  CHECK: 'チェック',
  CALL: 'コール',
  BET: 'ベット',
  RAISE: 'レイズ',
  FOLD: 'フォールド',
}

function ActionPanel({ onAction }: ActionPanelProps) {
  const { state } = useGameState()
  const currentPlayer = useMemo(() => getCurrentPlayer(state), [state])
  const available = useMemo(
    () => (currentPlayer ? availableActions(state, currentPlayer) : []),
    [currentPlayer, state],
  )
  const callAmount = useMemo(
    () => (currentPlayer ? toCall(state, currentPlayer) : 0),
    [currentPlayer, state],
  )

  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null)
  const [amount, setAmount] = useState('')

  const enabledActions = useMemo(
    () => available.filter((entry) => entry.enabled).map((entry) => entry.action),
    [available],
  )

  const activeAction =
    selectedAction && enabledActions.includes(selectedAction) ? selectedAction : null

  const requiresAmount = activeAction === 'BET' || activeAction === 'RAISE'
  const isBet = activeAction === 'BET'
  const isRaise = activeAction === 'RAISE'

  const minBet = Math.max(state.table.bb || 0, 1)
  const minRaiseTo = Math.max(state.table.currentBet + state.table.bb, state.table.currentBet + 1)
  const maxBet = currentPlayer?.stack ?? 0
  const maxRaiseTo = currentPlayer
    ? currentPlayer.betThisRound + currentPlayer.stack
    : Number.POSITIVE_INFINITY

  const parsedAmount = Number(amount)
  const hasInput = amount.trim() !== ''
  const isAmountNumber = Number.isFinite(parsedAmount)
  const meetsBetRule = isBet ? parsedAmount >= minBet : parsedAmount > 0
  const meetsRaiseRule = isRaise ? parsedAmount >= minRaiseTo : true
  const withinStackLimit =
    activeAction === 'BET'
      ? parsedAmount <= maxBet
      : activeAction === 'RAISE'
        ? parsedAmount <= maxRaiseTo
        : true

  const isValidAmount =
    hasInput && isAmountNumber && meetsBetRule && meetsRaiseRule && withinStackLimit

  const handleSelectAction = (action: ActionType) => {
    setSelectedAction(action)
    if (action === 'BET') {
      setAmount(String(minBet))
      return
    }

    if (action === 'RAISE') {
      setAmount(String(minRaiseTo))
      return
    }

    onAction?.({ type: action })
    setSelectedAction(null)
  }

  const confirmAmount = () => {
    if (!requiresAmount || !isValidAmount || !activeAction) return

    if (activeAction === 'BET') {
      onAction?.({ type: 'BET', amount: parsedAmount })
    }

    if (activeAction === 'RAISE') {
      onAction?.({ type: 'RAISE', raiseTo: parsedAmount })
    }

    setAmount('')
    setSelectedAction(null)
  }

  const cancelAmount = () => {
    setAmount('')
    setSelectedAction(null)
  }

  const disabledNotice = useMemo(() => {
    const blocked = available.find((entry) => !entry.enabled && entry.reason)
    if (!blocked) return null
    const action = blocked.action as ActionType
    return `${ACTION_LABEL[action]}不可: ${blocked.reason}`
  }, [available])

  const amountHelper = useMemo(() => {
    if (!requiresAmount) return undefined
    if (activeAction === 'BET') {
      if (parsedAmount > maxBet) return 'スタックを超えています（サイドポット未対応）'
      return `最小ベットは ${minBet}`
    }
    if (activeAction === 'RAISE') {
      if (parsedAmount > maxRaiseTo) return 'スタックを超えています（サイドポット未対応）'
      return `現在のベット ${state.table.currentBet} 以上に設定してください`
    }
    return undefined
  }, [activeAction, maxBet, maxRaiseTo, minBet, parsedAmount, requiresAmount, state.table.currentBet])

  return (
    <section className="action-panel" aria-label="手番アクション入力">
      <div className="action-panel__header">
        <div>
          <p className="label">手番</p>
          <h3 className="action-panel__title">{currentPlayer?.name ?? '手番待ち'}</h3>
          <p className="action-panel__hint">{activeAction ? ACTION_HINT[activeAction] : '実行するアクションを選択してください'}</p>
        </div>
        <div className="to-call">
          <p className="label">To Call</p>
          <p className="to-call__value">{callAmount}</p>
        </div>
      </div>

      <ActionButtons actions={available} selected={activeAction} onSelect={handleSelectAction} />

      {disabledNotice && <p className="action-panel__warning">{disabledNotice}</p>}

      {requiresAmount && (
        <AmountInput
          label={activeAction === 'BET' ? 'ベット額を入力' : 'レイズ後の合計額を入力'}
          value={amount}
          min={activeAction === 'BET' ? minBet : minRaiseTo}
          helperText={amountHelper}
          confirmLabel={activeAction === 'BET' ? 'ベットする' : 'レイズを確定'}
          isValid={isValidAmount}
          onChange={setAmount}
          onCancel={cancelAmount}
          onConfirm={confirmAmount}
        />
      )}
    </section>
  )
}

export default ActionPanel
