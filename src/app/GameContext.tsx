import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { applyAction, type GameAction } from '../domain/actions.ts'
import {
  createGameFromSetup,
  createInitialGameState,
  startHand as startHandRound,
} from '../domain/init.ts'
import { createActionLogEntry, type ActionLogEntry } from '../domain/logs.ts'
import type { Game, SetupConfig } from '../domain/types.ts'
import { createHistoryEntry, pushHistory, undoLastAction, type HistoryEntry } from '../domain/undo.ts'
import {
  clearPersistedState,
  loadPersistedState,
  savePersistedState,
  SCHEMA_VERSION,
  type LoadResult,
  type PersistedStateSnapshot,
} from '../persistence/localStorage.ts'

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

const createInitialState = (persisted?: PersistedStateSnapshot): GameState =>
  persisted ?? {
    game: createInitialGameState(),
    history: [],
    logs: [],
    logMarkers: [],
  }

type PersistenceState =
  | { status: 'ok'; savedAt: string; storedVersion: number }
  | { status: 'mismatch'; savedAt?: string; storedVersion: number }
  | { status: 'invalid' }
  | { status: 'empty' }

const GameStateContext = createContext<
  | {
      state: Game
      history: HistoryEntry[]
      logs: ActionLogEntry[]
      dispatch: React.Dispatch<GameStateAction>
      persistence: PersistenceState
      clearPersistence: () => void
      persistenceEnabled: boolean
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
  const [initialLoad] = useState<LoadResult>(() => loadPersistedState())
  const [persistenceEnabled, setPersistenceEnabled] = useState(
    initialLoad.status !== 'mismatch'
  )
  const skipInitialSave = useRef(initialLoad.status !== 'ok')
  const [persistence, setPersistence] = useState<PersistenceState>(() => {
    if (initialLoad.status === 'ok') {
      return { status: 'ok', savedAt: initialLoad.savedAt, storedVersion: SCHEMA_VERSION }
    }
    if (initialLoad.status === 'mismatch') {
      return {
        status: 'mismatch',
        savedAt: initialLoad.savedAt,
        storedVersion: initialLoad.storedVersion,
      }
    }
    return initialLoad.status === 'invalid' ? { status: 'invalid' } : { status: 'empty' }
  })

  const [state, setState] = useState(() =>
    createInitialState(initialLoad.status === 'ok' ? initialLoad.state : undefined)
  )

  const persistStateIfNeeded = useCallback(
    (nextState: GameState) => {
      if (!persistenceEnabled) return

      if (skipInitialSave.current) {
        skipInitialSave.current = false
        return
      }

      const savedAt = savePersistedState(nextState)
      setPersistence({ status: 'ok', savedAt, storedVersion: SCHEMA_VERSION })
    },
    [persistenceEnabled]
  )

  const dispatch: React.Dispatch<GameStateAction> = useCallback(
    (action) => {
      setState((current) => {
        const next = gameStateReducer(current, action)
        persistStateIfNeeded(next)
        return next
      })
    },
    [persistStateIfNeeded]
  )

  const clearPersistence = () => {
    clearPersistedState()
    setPersistence({ status: 'empty' })
    setPersistenceEnabled(true)
    skipInitialSave.current = true
  }

  return (
    <GameStateContext.Provider
      value={{
        state: state.game,
        history: state.history,
        logs: state.logs,
        dispatch,
        persistence,
        clearPersistence,
        persistenceEnabled,
      }}
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
