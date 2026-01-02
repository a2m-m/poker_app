import type { ActionAvailability, ActionType } from '../domain/types.ts'

type ActionButtonsProps = {
  actions: ActionAvailability[]
  selected?: ActionType | null
  onSelect: (action: ActionType) => void
}

const LABELS: Record<ActionType, string> = {
  CHECK: 'チェック',
  CALL: 'コール',
  BET: 'ベット',
  RAISE: 'レイズ',
  FOLD: 'フォールド',
}

const variantClass: Record<ActionType, string> = {
  CHECK: 'action-button--secondary',
  CALL: 'action-button--primary',
  BET: 'action-button--primary',
  RAISE: 'action-button--primary',
  FOLD: 'action-button--danger',
}

function ActionButtons({ actions, onSelect, selected = null }: ActionButtonsProps) {
  return (
    <div className="action-grid" role="group" aria-label="選択可能なアクション">
      {actions.map((entry) => {
        const isActive = selected === entry.action
        return (
          <button
            key={entry.action}
            type="button"
            className={`action-button ${variantClass[entry.action]} ${isActive ? 'is-active' : ''}`}
            onClick={() => onSelect(entry.action)}
            disabled={!entry.enabled}
            title={entry.reason}
          >
            {LABELS[entry.action]}
          </button>
        )
      })}
    </div>
  )
}

export default ActionButtons
