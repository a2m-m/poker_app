import type { ActionAvailability, Game, Player } from './types.ts'

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

export const availableActions = (state: Game, player: Player): ActionAvailability[] => {
  if (player.status !== 'ACTIVE') return []

  const callAmount = toCall(state, player)
  const hasStack = player.stack > 0
  const results: ActionAvailability[] = []

  const add = (entry: ActionAvailability) => {
    results.push(entry)
  }

  add({ action: 'FOLD', enabled: true })

  add({
    action: 'CHECK',
    enabled: callAmount === 0,
    reason: callAmount !== 0 ? '差額が残っています' : undefined,
  })

  add({
    action: 'BET',
    enabled: callAmount === 0 && state.table.currentBet === 0 && hasStack,
    reason:
      callAmount !== 0
        ? '現在のベットに追いついてください'
        : state.table.currentBet > 0
          ? '既にベットが存在します'
          : hasStack
            ? undefined
            : 'スタックがありません',
  })

  add({
    action: 'CALL',
    enabled: callAmount > 0 && player.stack >= callAmount,
    reason:
      callAmount === 0
        ? 'コールは不要です'
        : player.stack < callAmount
          ? 'スタック不足（サイドポット未対応）'
          : undefined,
  })

  const canBeatCurrentBet = player.betThisRound + player.stack > state.table.currentBet
  add({
    action: 'RAISE',
    enabled: state.table.currentBet > 0 && canBeatCurrentBet && player.stack > callAmount,
    reason:
      state.table.currentBet <= 0
        ? 'まだベットがありません'
        : !canBeatCurrentBet || player.stack <= callAmount
          ? 'スタック不足（サイドポット未対応）'
          : undefined,
  })

  return results
}
