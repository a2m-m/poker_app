import { applyAction, type GameAction } from './actions.ts'
import { createInitialGameState } from './init.ts'
import type { GameState } from './types.ts'

export type GameEvent = GameAction | { type: 'RESET' }

export const gameReducer = (state: GameState, event: GameEvent): GameState => {
  if (event.type === 'RESET') {
    return createInitialGameState()
  }

  return applyAction(state, event)
}
