import type { PlayerCardProps } from './PlayerCard.tsx'
import PlayerCard from './PlayerCard.tsx'

const samplePlayers: PlayerCardProps[] = [
  { name: 'Button', stack: 12000, position: 'BTN' },
  { name: 'Small Blind', stack: 8000, position: 'SB' },
  { name: 'Big Blind', stack: 8500, position: 'BB' },
  { name: 'UTG', stack: 15000, position: 'UTG' },
]

type PlayerGridProps = {
  players?: PlayerCardProps[]
}

export function PlayerGrid({ players = samplePlayers }: PlayerGridProps) {
  return (
    <section className="player-grid">
      {players.map((player) => (
        <PlayerCard key={player.position} {...player} />
      ))}
    </section>
  )
}

export default PlayerGrid
