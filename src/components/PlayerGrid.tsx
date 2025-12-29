import type { PlayerCardProps } from './PlayerCard.tsx'
import PlayerCard from './PlayerCard.tsx'

const samplePlayers: PlayerCardProps[] = [
  { id: '1', name: 'Button', stack: 12000, betThisRound: 200, badges: ['BTN'], seat: 1 },
  { id: '2', name: 'Small Blind', stack: 8000, betThisRound: 400, badges: ['SB'], seat: 2 },
  { id: '3', name: 'Big Blind', stack: 8500, betThisRound: 800, badges: ['BB'], seat: 3 },
  { id: '4', name: 'UTG', stack: 15000, betThisRound: 0, badges: ['TURN'], seat: 4 },
]

type PlayerGridProps = {
  players?: PlayerCardProps[]
}

export function PlayerGrid({ players = samplePlayers }: PlayerGridProps) {
  return (
    <section className="player-grid" aria-label="プレイヤー一覧">
      {players.map((player) => (
        <PlayerCard key={player.id ?? player.name} {...player} />
      ))}
    </section>
  )
}

export default PlayerGrid
