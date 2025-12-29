import type { ActionLogEntry } from '../domain/logs.ts'
import type { Round } from '../domain/types.ts'

type ActionLogPanelProps = {
  entries: ActionLogEntry[]
}

const ACTION_LABEL: Record<ActionLogEntry['action'], string> = {
  CHECK: 'チェック',
  CALL: 'コール',
  BET: 'ベット',
  RAISE: 'レイズ',
  FOLD: 'フォールド',
}

const ROUND_LABEL: Record<Round, string> = {
  PREFLOP: 'Preflop',
  FLOP: 'Flop',
  TURN: 'Turn',
  RIVER: 'River',
  SHOWDOWN: 'Showdown',
}

export function ActionLogPanel({ entries }: ActionLogPanelProps) {
  return (
    <div className="action-log">
      <div className="action-log__header">
        <div>
          <p className="label">直近のアクション</p>
          <h3 className="action-log__title">Action Log</h3>
          <p className="lede">手番ごとの流れを簡潔に記録しています。</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="action-log__empty">まだログがありません</p>
      ) : (
        <ul className="action-log__list">
          {entries.map((entry) => (
            <li key={entry.id} className="action-log__item">
              <div className="action-log__identity">
                <span className="action-log__player">{entry.playerName}</span>
                <span className="action-log__round">{ROUND_LABEL[entry.round]}</span>
              </div>
              <div className="action-log__detail">
                <span className="action-log__action">{ACTION_LABEL[entry.action]}</span>
                <span className="action-log__amount">{entry.amount}</span>
              </div>
              <time className="action-log__time" dateTime={String(entry.createdAt)}>
                {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ActionLogPanel
