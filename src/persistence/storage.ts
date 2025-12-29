import type { GameState } from '../domain/types.ts'

const STORAGE_KEY = 'poker-dealer-assist::game'

export const saveGame = (state: GameState) => {
  const payload = {
    schemaVersion: 1,
    savedAt: new Date().toISOString(),
    state,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export const loadGame = (): GameState | null => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return null

  try {
    const parsed = JSON.parse(saved) as { state?: GameState }
    return parsed.state ?? null
  } catch (error) {
    console.warn('保存データの読み込みに失敗しました', error)
    return null
  }
}

export const clearGame = () => {
  localStorage.removeItem(STORAGE_KEY)
}
