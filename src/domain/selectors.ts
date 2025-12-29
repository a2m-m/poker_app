import type { Game } from './types.ts'

export const selectTableSummary = (state: Game) => ({
  name: state.tableName,
  stage: state.table.round,
  pot: state.table.pot,
  players: state.players.length,
})

export const selectCurrentPot = (state: Game) => state.table.pot
