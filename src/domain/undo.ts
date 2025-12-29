import type { Game } from './types.ts'

export type HistoryEntry = Game

export const pushHistory = (
  history: HistoryEntry[],
  snapshot: Game,
): HistoryEntry[] => [...history, snapshot]

export const popHistory = (
  history: HistoryEntry[],
): [HistoryEntry[], Game | undefined] => {
  const nextHistory = [...history]
  const last = nextHistory.pop()
  return [nextHistory, last]
}
