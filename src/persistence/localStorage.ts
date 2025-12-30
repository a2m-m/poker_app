import type { ActionLogEntry } from '../domain/logs.ts'
import type { Game } from '../domain/types.ts'
import type { HistoryEntry } from '../domain/undo.ts'

const STORAGE_KEY = 'poker-dealer-assist::game'
export const SCHEMA_VERSION = 2

export type PersistedStateSnapshot = {
  game: Game
  history: HistoryEntry[]
  logs: ActionLogEntry[]
  logMarkers: boolean[]
}

type PersistedPayload = {
  schemaVersion: number
  savedAt: string
  state: PersistedStateSnapshot
}

const isPersistedStateSnapshot = (value: unknown): value is PersistedStateSnapshot => {
  if (!value || typeof value !== 'object') return false

  const snapshot = value as Partial<PersistedStateSnapshot>
  return (
    !!snapshot.game &&
    Array.isArray(snapshot.history) &&
    Array.isArray(snapshot.logs) &&
    Array.isArray(snapshot.logMarkers)
  )
}

export type LoadResult =
  | { status: 'empty' }
  | { status: 'ok'; state: PersistedStateSnapshot; savedAt: string }
  | { status: 'mismatch'; savedAt?: string; storedVersion: number }
  | { status: 'invalid' }

export const savePersistedState = (state: PersistedStateSnapshot) => {
  const payload: PersistedPayload = {
    schemaVersion: SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    state,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  return payload.savedAt
}

export const loadPersistedState = (): LoadResult => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return { status: 'empty' }

  try {
    const parsed = JSON.parse(saved) as Partial<PersistedPayload>
    if (typeof parsed?.schemaVersion !== 'number') {
      clearPersistedState()
      return { status: 'invalid' }
    }

    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      return {
        status: 'mismatch',
        savedAt: parsed.savedAt,
        storedVersion: parsed.schemaVersion,
      }
    }

    if (!parsed.state || typeof parsed.savedAt !== 'string') {
      clearPersistedState()
      return { status: 'invalid' }
    }

    if (!isPersistedStateSnapshot(parsed.state)) {
      clearPersistedState()
      return { status: 'invalid' }
    }

    return {
      status: 'ok',
      state: parsed.state,
      savedAt: parsed.savedAt,
    }
  } catch (error) {
    console.warn('保存データの読み込みに失敗しました', error)
    clearPersistedState()
    return { status: 'invalid' }
  }
}

export const clearPersistedState = () => {
  localStorage.removeItem(STORAGE_KEY)
}

export const hasSavedState = () => loadPersistedState().status === 'ok'
