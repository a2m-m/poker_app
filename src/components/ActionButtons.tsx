import type { ActionType } from '../domain/types.ts'

type ActionButtonsProps = {
  actions: ActionType[]
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
      {actions.map((action) => {
        const isActive = selected === action
        return (
          <button
            key={action}
            type="button"
            className={`action-button ${variantClass[action]} ${isActive ? 'is-active' : ''}`}
            onClick={() => onSelect(action)}
          >
            {LABELS[action]}
          </button>
        )
      })}
    </div>
  )
}

export default ActionButtons
