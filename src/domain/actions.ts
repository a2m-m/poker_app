import type { GameStage, GameState } from './types.ts'

export type GameAction =
  | { type: 'SET_TABLE_NAME'; name: string }
  | { type: 'ADVANCE_STAGE'; nextStage: GameStage }
  | { type: 'UPDATE_POT'; pot: number }

export const applyAction = (
  state: GameState,
  action: GameAction,
): GameState => {
  switch (action.type) {
    case 'SET_TABLE_NAME':
      return { ...state, tableName: action.name }
    case 'ADVANCE_STAGE':
      return { ...state, stage: action.nextStage }
    case 'UPDATE_POT':
      return { ...state, pot: action.pot }
    default:
      return state
  }
}
