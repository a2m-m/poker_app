import { createContext, useContext, useReducer, type ReactNode } from 'react'
import { applyAction, type GameAction } from '../domain/actions.ts'
import {
  createGameFromSetup,
  createInitialGameState,
  startHand as startHandRound,
} from '../domain/init.ts'
import type { Game, SetupConfig } from '../domain/types.ts'
import { createHistoryEntry, pushHistory, undoLastAction, type HistoryEntry } from '../domain/undo.ts'

export type GameStateAction =
  | { type: 'GAME_CREATE'; payload: SetupConfig }
  | { type: 'HAND_START' }
  | { type: 'ACTION_APPLY'; payload: GameAction }
  | { type: 'ACTION_UNDO' }

type GameState = {
  game: Game
  history: HistoryEntry[]
}

const createInitialState = (): GameState => ({
  game: createInitialGameState(),
  history: [],
})

const GameStateContext = createContext<
  | {
      state: Game
      history: HistoryEntry[]
      dispatch: React.Dispatch<GameStateAction>
    }
  | undefined
>(undefined)

const gameStateReducer = (state: GameState, action: GameStateAction): GameState => {
  switch (action.type) {
    case 'GAME_CREATE':
      return {
        game: createGameFromSetup(action.payload),
        history: [],
      }
    case 'HAND_START': {
      const started = startHandRound(state.game)
      return {
        game: started,
        history: pushHistory(state.history, createHistoryEntry(state.game, started)),
      }
    }
    case 'ACTION_APPLY': {
      const updated = applyAction(state.game, action.payload)
      return {
        game: updated,
        history: pushHistory(state.history, createHistoryEntry(state.game, updated)),
      }
    }
    case 'ACTION_UNDO': {
      const undone = undoLastAction(state.game, state.history)
      return undone
    }
    default:
      return state
  }
}

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameStateReducer, undefined, createInitialState)

  return (
    <GameStateContext.Provider value={{ state: state.game, history: state.history, dispatch }}>
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
