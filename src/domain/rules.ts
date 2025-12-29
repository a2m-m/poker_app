import type { GameStage } from './types.ts'

export const nextStage = (stage: GameStage): GameStage => {
  const order: GameStage[] = ['preflop', 'flop', 'turn', 'river', 'showdown']
  const currentIndex = order.indexOf(stage)
  return currentIndex >= 0 && currentIndex < order.length - 1
    ? order[currentIndex + 1]
    : 'showdown'
}
