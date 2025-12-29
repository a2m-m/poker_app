import type { Round } from './types.ts'

export const nextStage = (stage: Round): Round => {
  const order: Round[] = ['PREFLOP', 'FLOP', 'TURN', 'RIVER', 'SHOWDOWN']
  const currentIndex = order.indexOf(stage)
  return currentIndex >= 0 && currentIndex < order.length - 1
    ? order[currentIndex + 1]
    : 'SHOWDOWN'
}
