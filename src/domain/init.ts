import type { GameState } from './types.ts'

export const createInitialGameState = (): GameState => ({
  tableName: 'Demo Table',
  players: [],
  stage: 'preflop',
  pot: 0,
})
