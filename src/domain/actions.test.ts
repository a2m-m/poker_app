import { describe, expect, it } from 'vitest'
import { applyAction } from './actions.ts'
import { startHand, createGameFromSetup } from './init.ts'
import { availableActions } from './selectors.ts'
import type { Game, Player, SetupConfig } from './types.ts'

describe('availableActions', () => {
  it('CALL/RAISE をサイドポットが必要な状況で無効化する', () => {
    const player: Player = {
      id: 'p1',
      name: 'Alice',
      stack: 50,
      betThisRound: 0,
      status: 'ACTIVE',
    }

    const game: Game = {
      tableName: 'Test',
      players: [player],
      table: {
        pot: 0,
        round: 'PREFLOP',
        sb: 50,
        bb: 100,
        buttonIndex: 0,
        currentBet: 100,
        currentPlayerId: 'p1',
        lastAggressorId: undefined,
      },
    }

    const actions = availableActions(game, player)
    const call = actions.find((entry) => entry.action === 'CALL')
    const raise = actions.find((entry) => entry.action === 'RAISE')

    expect(call?.enabled).toBe(false)
    expect(call?.reason).toContain('サイドポット未対応')
    expect(raise?.enabled).toBe(false)
    expect(raise?.reason).toContain('サイドポット未対応')
  })
})

describe('startHand validations', () => {
  it('ブラインドを支払えないプレイヤーがいる場合は開始を拒否する', () => {
    const setup: SetupConfig = {
      tableName: 'Test',
      smallBlind: 50,
      bigBlind: 100,
      buttonIndex: 0,
      players: [
        { name: 'Alice', stack: 80 },
        { name: 'Bob', stack: 120 },
      ],
    }

    const game = createGameFromSetup(setup)

    expect(() => startHand(game)).toThrowError('ブラインドを支払うスタックが不足しています')
  })
})

describe('applyAction invariants', () => {
  it('CALL 後もスタック・ベット・ポットが非負で整合する', () => {
    const game: Game = {
      tableName: 'Test',
      players: [
        { id: 'p1', name: 'Alice', stack: 950, betThisRound: 50, status: 'ACTIVE' },
        { id: 'p2', name: 'Bob', stack: 900, betThisRound: 100, status: 'ACTIVE' },
      ],
      table: {
        pot: 150,
        round: 'PREFLOP',
        sb: 50,
        bb: 100,
        buttonIndex: 0,
        currentBet: 100,
        currentPlayerId: 'p1',
        lastAggressorId: 'p2',
      },
    }

    const next = applyAction(game, { type: 'PLAYER_ACTION', action: { type: 'CALL' } })

    next.players.forEach((player) => {
      expect(player.stack).toBeGreaterThanOrEqual(0)
      expect(player.betThisRound).toBeGreaterThanOrEqual(0)
    })
    expect(next.table.pot).toBeGreaterThanOrEqual(0)
    expect(next.table.currentBet).toBe(
      next.players.reduce((max, player) => Math.max(max, player.betThisRound), 0),
    )
  })

  it('ショーダウン後に残り1人でもポットを分配して状態を維持する', () => {
    const game: Game = {
      tableName: 'Test',
      players: [
        { id: 'p1', name: 'Alice', stack: 0, betThisRound: 0, status: 'ACTIVE' },
        { id: 'p2', name: 'Bob', stack: 0, betThisRound: 0, status: 'ACTIVE' },
      ],
      table: {
        pot: 200,
        round: 'SHOWDOWN',
        sb: 50,
        bb: 100,
        buttonIndex: 0,
        currentBet: 0,
        currentPlayerId: 'p1',
        lastAggressorId: undefined,
      },
    }

    const resolved = applyAction(game, { type: 'RESOLVE_SHOWDOWN', winnerId: 'p1' })

    expect(resolved.players).toHaveLength(1)
    expect(resolved.players[0]).toMatchObject({ id: 'p1', stack: 200, betThisRound: 0 })
    expect(resolved.table.pot).toBe(0)
    expect(resolved.table.currentBet).toBe(0)
    expect(resolved.table.currentPlayerId).toBe('')
    expect(resolved.table.round).toBe('SHOWDOWN')
  })
})
