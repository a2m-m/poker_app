import type { Game, Round } from './types.ts'

export type GameAction =
  | { type: 'SET_TABLE_NAME'; name: string }
  | { type: 'ADVANCE_STAGE'; nextStage: Round }
  | { type: 'UPDATE_POT'; pot: number }

export const applyAction = (
  state: Game,
  action: GameAction,
): Game => {
  switch (action.type) {
    case 'SET_TABLE_NAME':
      return { ...state, tableName: action.name }
    case 'ADVANCE_STAGE':
      return { ...state, table: { ...state.table, round: action.nextStage } }
    case 'UPDATE_POT':
      return { ...state, table: { ...state.table, pot: action.pot } }
    default:
      return state
  }
}
