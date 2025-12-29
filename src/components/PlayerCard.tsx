import Badge, { type BadgeVariant } from './Badge.tsx'

export type PlayerBadge = 'BTN' | 'SB' | 'BB' | 'TURN' | 'FOLD' | string

export type PlayerCardProps = {
  id?: string
  seat?: number
  name: string
  stack: number
  betThisRound: number
  badges?: PlayerBadge[]
  isTurn?: boolean
  isFolded?: boolean
}

const BADGE_VARIANT_MAP: Record<PlayerBadge, BadgeVariant> = {
  BTN: 'accent',
  SB: 'default',
  BB: 'default',
  TURN: 'accent',
  FOLD: 'muted',
}

const getBadgeVariant = (badge: PlayerBadge): BadgeVariant => BADGE_VARIANT_MAP[badge] ?? 'default'

export function PlayerCard({
  seat,
  name,
  stack,
  betThisRound,
  badges = [],
  isTurn = false,
  isFolded = false,
}: PlayerCardProps) {
  const cardClassNames = ['player-card']
  if (isTurn) cardClassNames.push('is-turn')
  if (isFolded) cardClassNames.push('is-folded')

  const statusLabel = isFolded ? 'フォールド中' : isTurn ? '現在の手番' : 'アクション待ち'

  return (
    <div className={cardClassNames.join(' ')}>
      <div className="player-card__header">
        <div className="player-card__identity">
          {typeof seat === 'number' && <p className="player-seat">Seat {seat}</p>}
          <p className="player-name">{name}</p>
          <p className="player-status">{statusLabel}</p>
        </div>
        <div className="player-badges" aria-label="プレイヤーバッジ一覧">
          {badges.map((badge) => (
            <Badge key={badge} label={badge} variant={getBadgeVariant(badge)} />
          ))}
        </div>
      </div>

      <div className="player-card__chips" aria-label="スタックとベット">
        <div className="chip-metric">
          <span className="chip-metric__label">Stack</span>
          <span className="chip-metric__value">{stack.toLocaleString()}</span>
        </div>
        <div className="chip-metric chip-metric--bet">
          <span className="chip-metric__label">Bet</span>
          <span className="chip-metric__value">{betThisRound.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

export default PlayerCard
