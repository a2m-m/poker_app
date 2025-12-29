type ActionPanelProps = {
  onAction?: (action: string) => void
}

const actions: string[] = ['CHECK', 'CALL', 'BET', 'RAISE', 'FOLD']

export function ActionPanel({ onAction }: ActionPanelProps) {
  return (
    <section className="action-panel">
      <div className="label">アクション</div>
      <div className="action-grid">
        {actions.map((action) => (
          <button
            key={action}
            className="action-button"
            type="button"
            onClick={() => onAction?.(action)}
          >
            {action}
          </button>
        ))}
      </div>
    </section>
  )
}

export default ActionPanel
