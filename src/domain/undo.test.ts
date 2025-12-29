import { describe, expect, it } from 'vitest'
import { applyAction } from './actions.ts'
import { createGameFromSetup, startHand } from './init.ts'
import type { Game } from './types.ts'
import { createHistoryEntry, pushHistory, undoLastAction, type HistoryEntry } from './undo.ts'

type GameWithHistory = {
  game: Game
  history: HistoryEntry[]
}

const recordTransition = (state: GameWithHistory, nextGame: Game): GameWithHistory => ({
  game: nextGame,
  history: pushHistory(state.history, createHistoryEntry(state.game, nextGame)),
})

describe('undoLastAction', () => {
  const setupGame = (): GameWithHistory => ({
    game: createGameFromSetup({
      smallBlind: 50,
      bigBlind: 100,
      buttonIndex: 0,
      players: [
        { name: 'Alice', stack: 1000 },
        { name: 'Bob', stack: 1000 },
        { name: 'Carol', stack: 1000 },
      ],
    }),
    history: [],
  })

  it('差分履歴から直前アクションを正しく取り消し、数値整合性を維持する', () => {
    let state = setupGame()

    state = recordTransition(state, startHand(state.game))

    state = recordTransition(
      state,
      applyAction(state.game, { type: 'PLAYER_ACTION', action: { type: 'CALL' } }),
    )

    state = recordTransition(
      state,
      applyAction(state.game, { type: 'PLAYER_ACTION', action: { type: 'CALL' } }),
    )

    const beforeBet = state.game
    state = recordTransition(
      state,
      applyAction(state.game, { type: 'PLAYER_ACTION', action: { type: 'BET', amount: 200 } }),
    )

    const potBeforeUndo = beforeBet.table.pot
    const stacksBeforeUndo = beforeBet.players.map((player) => player.stack)
    const betsBeforeUndo = beforeBet.players.map((player) => player.betThisRound)

    const undone = undoLastAction(state.game, state.history)

    const potAfterUndo = undone.game.table.pot
    const stacksAfterUndo = undone.game.players.map((player) => player.stack)
    const betsAfterUndo = undone.game.players.map((player) => player.betThisRound)

    const totalChips = (game: Game) =>
      game.table.pot + game.players.reduce((sum, player) => sum + player.stack + player.betThisRound, 0)

    expect(potAfterUndo).toBe(potBeforeUndo)
    expect(stacksAfterUndo).toStrictEqual(stacksBeforeUndo)
    expect(betsAfterUndo).toStrictEqual(betsBeforeUndo)
    expect(undone.history.length).toBe(state.history.length - 1)
    expect(totalChips(undone.game)).toBe(totalChips(beforeBet))
    expect(undone.game.table.currentBet).toBe(beforeBet.table.currentBet)
    expect(undone.game.table.round).toBe(beforeBet.table.round)
  })

  it('履歴が空の場合は状態を変更しない', () => {
    const state = setupGame()
    const undone = undoLastAction(state.game, state.history)

    expect(undone.game).toStrictEqual(state.game)
    expect(undone.history).toStrictEqual(state.history)
  })
})
