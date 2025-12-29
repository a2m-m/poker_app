import { createContext, useContext, useReducer, type ReactNode } from 'react'
import { applyAction, type GameAction } from '../domain/actions.ts'
import {
  createGameFromSetup,
  createInitialGameState,
  startHand as startHandRound,
} from '../domain/init.ts'
import { createActionLogEntry, type ActionLogEntry } from '../domain/logs.ts'
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
  logs: ActionLogEntry[]
  logMarkers: boolean[]
}

const createInitialState = (): GameState => ({
  game: createInitialGameState(),
  history: [],
  logs: [],
  logMarkers: [],
})

const GameStateContext = createContext<
  | {
      state: Game
      history: HistoryEntry[]
      logs: ActionLogEntry[]
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
        logs: [],
        logMarkers: [],
      }
    case 'HAND_START': {
      const started = startHandRound(state.game)
      const entry = createHistoryEntry(state.game, started)
      return {
        game: started,
        history: pushHistory(state.history, entry),
        logs: state.logs,
        logMarkers: entry ? [...state.logMarkers, false] : state.logMarkers,
      }
    }
    case 'ACTION_APPLY': {
      const logEntry =
        action.payload.type === 'PLAYER_ACTION'
          ? createActionLogEntry(state.game, action.payload)
          : null
      const updated = applyAction(state.game, action.payload)
      const entry = createHistoryEntry(state.game, updated)
      return {
        game: updated,
        history: pushHistory(state.history, entry),
        logs: logEntry ? [logEntry, ...state.logs] : state.logs,
        logMarkers: entry ? [...state.logMarkers, !!logEntry] : state.logMarkers,
      }
    }
    case 'ACTION_UNDO': {
      const hadHistory = state.history.length > 0
      const lastMarker = state.logMarkers[state.logMarkers.length - 1] ?? false
      const nextMarkers = hadHistory ? state.logMarkers.slice(0, -1) : state.logMarkers
      const undone = undoLastAction(state.game, state.history)
      return undone
        ? {
            game: undone.game,
            history: undone.history,
            logs: hadHistory && lastMarker ? state.logs.slice(1) : state.logs,
            logMarkers: nextMarkers,
          }
        : state
    }
    default:
      return state
  }
}

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameStateReducer, undefined, createInitialState)

  return (
    <GameStateContext.Provider
      value={{ state: state.game, history: state.history, logs: state.logs, dispatch }}
    >
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
