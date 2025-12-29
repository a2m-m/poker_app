import type { GameState } from './types.ts'

export type HistoryEntry = GameState

export const pushHistory = (
  history: HistoryEntry[],
  snapshot: GameState,
): HistoryEntry[] => [...history, snapshot]

export const popHistory = (
  history: HistoryEntry[],
): [HistoryEntry[], GameState | undefined] => {
  const nextHistory = [...history]
  const last = nextHistory.pop()
  return [nextHistory, last]
}
