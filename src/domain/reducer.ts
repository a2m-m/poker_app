import { applyAction, type GameAction } from './actions.ts'
import { createInitialGameState } from './init.ts'
import type { Game } from './types.ts'

export type GameEvent = GameAction | { type: 'RESET' }

export const gameReducer = (state: Game, event: GameEvent): Game => {
  if (event.type === 'RESET') {
    return createInitialGameState()
  }

  return applyAction(state, event)
}
