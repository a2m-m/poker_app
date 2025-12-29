export type UtilityActionKey = 'logs' | 'handRanks' | 'judge' | 'settings'

const ACTION_LABELS: Record<UtilityActionKey, string> = {
  logs: 'ログ',
  handRanks: '役一覧',
  judge: '判定ツール',
  settings: '設定',
}

type UtilityActionsProps = {
  onSelect?: (action: UtilityActionKey) => void
}

export function UtilityActions({ onSelect }: UtilityActionsProps) {
  return (
    <div className="utility-actions">
      <div className="utility-actions__header">
        <p className="label">サブツール</p>
        <h2>Utility Actions</h2>
        <p className="lede">ログや役確認など、補助系の導線をまとめています。</p>
      </div>
      <div className="utility-actions__grid">
        {(Object.keys(ACTION_LABELS) as UtilityActionKey[]).map((actionKey) => (
          <button
            key={actionKey}
            type="button"
            className="utility-actions__button"
            onClick={() => onSelect?.(actionKey)}
          >
            <span className="utility-actions__label">{ACTION_LABELS[actionKey]}</span>
            <span className="utility-actions__hint">タップして開く</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default UtilityActions
