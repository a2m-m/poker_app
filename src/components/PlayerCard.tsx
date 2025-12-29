export type PlayerCardProps = {
  name: string
  stack: number
  position: string
  status?: string
}

export function PlayerCard({
  name,
  stack,
  position,
  status = 'アクション待ち',
}: PlayerCardProps) {
  return (
    <div className="player-card">
      <div className="player-header">
        <span className="player-position">{position}</span>
        <span className="player-name">{name}</span>
      </div>
      <div className="player-stack">
        スタック: {stack.toLocaleString()} chips
      </div>
      <div className="player-status">{status}</div>
    </div>
  )
}

export default PlayerCard
