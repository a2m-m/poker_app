export type PlayerId = string

export type GameStage = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'

export interface Player {
  id: PlayerId
  name: string
  stack: number
  position: string
  betThisRound?: number
}

export interface GameState {
  tableName: string
  players: Player[]
  stage: GameStage
  pot: number
}
