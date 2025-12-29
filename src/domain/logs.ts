import type { Action, ActionType, Game, Round } from './types.ts'

export type ActionLogEntry = {
  id: string
  playerId: string
  playerName: string
  action: ActionType
  amount: number
  round: Round
  createdAt: number
}

const createLogId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const toCall = (state: Game, playerId: string): number => {
  const player = state.players.find((entry) => entry.id === playerId)
  if (!player) return 0

  return Math.max(0, state.table.currentBet - player.betThisRound)
}

const resolveAmount = (state: Game, playerId: string, action: Action): number => {
  switch (action.type) {
    case 'CALL':
      return toCall(state, playerId)
    case 'BET':
      return action.amount ?? 0
    case 'RAISE':
      return action.raiseTo ?? 0
    case 'CHECK':
    case 'FOLD':
    default:
      return 0
  }
}

export const createActionLogEntry = (
  state: Game,
  action: { type: 'PLAYER_ACTION'; action: Action },
): ActionLogEntry | null => {
  const actor = state.players.find((player) => player.id === state.table.currentPlayerId)

  if (!actor) return null

  const amount = resolveAmount(state, actor.id, action.action)

  return {
    id: createLogId(),
    playerId: actor.id,
    playerName: actor.name,
    action: action.action.type,
    amount,
    round: state.table.round,
    createdAt: Date.now(),
  }
}
