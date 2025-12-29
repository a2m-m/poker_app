import type { ActionType, Game, Player } from './types.ts'

export const selectTableSummary = (state: Game) => ({
  name: state.tableName,
  stage: state.table.round,
  pot: state.table.pot,
  players: state.players.length,
})

export const selectCurrentPot = (state: Game) => state.table.pot

export const getCurrentPlayer = (state: Game): Player | undefined =>
  state.players.find((player) => player.id === state.table.currentPlayerId)

export const toCall = (state: Game, player: Player): number =>
  Math.max(0, state.table.currentBet - player.betThisRound)

export const availableActions = (state: Game, player: Player): ActionType[] => {
  if (player.status !== 'ACTIVE') return []

  const actions: ActionType[] = ['FOLD']
  const callAmount = toCall(state, player)

  if (callAmount === 0) {
    actions.push('CHECK')
    if (state.table.currentBet === 0 && player.stack > 0) {
      actions.push('BET')
    }
  } else {
    if (player.stack >= callAmount) {
      actions.push('CALL')
    }
    if (state.table.currentBet > 0 && player.stack > callAmount) {
      actions.push('RAISE')
    }
  }

  return actions
}
