import type { GameState } from './types.ts'

export const selectTableSummary = (state: GameState) => ({
  name: state.tableName,
  stage: state.stage,
  pot: state.pot,
  players: state.players.length,
})

export const selectCurrentPot = (state: GameState) => state.pot
