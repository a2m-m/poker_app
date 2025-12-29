import { createContext, useContext, useReducer, type ReactNode } from 'react'
import { applyAction, type GameAction } from '../domain/actions.ts'
import {
  createGameFromSetup,
  createInitialGameState,
  startHand as startHandRound,
} from '../domain/init.ts'
import type { Game, SetupConfig } from '../domain/types.ts'

export type GameStateAction =
  | { type: 'GAME_CREATE'; payload: SetupConfig }
  | { type: 'HAND_START' }
  | { type: 'ACTION_APPLY'; payload: GameAction }

const GameStateContext = createContext<
  | {
      state: Game
      dispatch: React.Dispatch<GameStateAction>
    }
  | undefined
>(undefined)

const gameStateReducer = (state: Game, action: GameStateAction): Game => {
  switch (action.type) {
    case 'GAME_CREATE':
      return createGameFromSetup(action.payload)
    case 'HAND_START':
      return startHandRound(state)
    case 'ACTION_APPLY':
      return applyAction(state, action.payload)
    default:
      return state
  }
}

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameStateReducer, undefined, createInitialGameState)

  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useGameState = () => {
  const context = useContext(GameStateContext)
  if (!context) {
    throw new Error('GameState は GameProvider の内部でのみ利用できます')
  }

  return context
}
