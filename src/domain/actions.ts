import { startHand, startRound } from './init.ts'
import { nextStage } from './rules.ts'
import type { Action, Game, Round, Table } from './types.ts'

const toCall = (state: Game, playerIndex: number): number => {
  const player = state.players[playerIndex]
  if (!player) return 0
  return Math.max(0, state.table.currentBet - player.betThisRound)
}

const findNextActivePlayerId = (
  players: Game['players'],
  startIndex: number,
): string | undefined => {
  if (players.length === 0) return undefined

  for (let offset = 0; offset < players.length; offset += 1) {
    const index = (startIndex + offset) % players.length
    if (players[index]?.status === 'ACTIVE') {
      return players[index]?.id
    }
  }

  return undefined
}

const getRoundStartIndex = (
  round: Round,
  buttonIndex: number,
  playerCount: number,
) => (round === 'PREFLOP' ? buttonIndex + 3 : buttonIndex + 1) % Math.max(playerCount, 1)

const getRoundStartPlayerId = (state: Game | { players: Game['players']; table: Table }) =>
  findNextActivePlayerId(
    state.players,
    getRoundStartIndex(state.table.round, state.table.buttonIndex, state.players.length),
  )

const advanceRound = (state: Game): Game => startRound(state, nextStage(state.table.round))

const settleHandAndStartNext = (state: Game, winnerId: string): Game => {
  const winnerExists = state.players.some((player) => player.id === winnerId)

  if (!winnerExists) {
    throw new Error('勝者のプレイヤーが見つかりません')
  }

  const potAmount = state.table.pot

  const resetPlayers = state.players.map((player) => ({
    ...player,
    stack: player.stack + (player.id === winnerId ? potAmount : 0),
    betThisRound: 0,
    status: 'ACTIVE' as const,
  }))

  const nextButtonIndex =
    resetPlayers.length > 0
      ? (state.table.buttonIndex + 1) % resetPlayers.length
      : state.table.buttonIndex

  const nextGame: Game = {
    ...state,
    players: resetPlayers,
    table: {
      ...state.table,
      pot: 0,
      currentBet: 0,
      currentPlayerId: '',
      lastAggressorId: undefined,
      buttonIndex: nextButtonIndex,
    },
  }

  return startHand(nextGame)
}

const ensureNonNegative = (game: Game): Game => {
  const hasNegativePlayer = game.players.some(
    (player) => player.stack < 0 || player.betThisRound < 0,
  )

  if (hasNegativePlayer) {
    throw new Error('プレイヤーのスタックまたはベットが負の値です')
  }

  if (game.table.pot < 0 || game.table.currentBet < 0) {
    throw new Error('ポットまたは現在のベットが負の値です')
  }

  return game
}

export type GameAction =
  | { type: 'SET_TABLE_NAME'; name: string }
  | { type: 'ADVANCE_STAGE'; nextStage: Round }
  | { type: 'UPDATE_POT'; pot: number }
  | { type: 'RESOLVE_SHOWDOWN'; winnerId: string }
  | { type: 'PLAYER_ACTION'; action: Action }

export const applyAction = (
  state: Game,
  action: GameAction,
): Game => {
  switch (action.type) {
    case 'SET_TABLE_NAME':
      return ensureNonNegative({ ...state, tableName: action.name })
    case 'ADVANCE_STAGE':
      return ensureNonNegative({ ...state, table: { ...state.table, round: action.nextStage } })
    case 'UPDATE_POT':
      return ensureNonNegative({ ...state, table: { ...state.table, pot: action.pot } })
    case 'RESOLVE_SHOWDOWN': {
      if (state.table.round !== 'SHOWDOWN') {
        throw new Error('ショーダウン中のみ勝者を決定できます')
      }

      return ensureNonNegative(settleHandAndStartNext(state, action.winnerId))
    }
    case 'PLAYER_ACTION': {
      const currentIndex = state.players.findIndex(
        (player) => player.id === state.table.currentPlayerId,
      )

      if (currentIndex === -1) {
        throw new Error('現在のプレイヤーが見つかりません')
      }

      const actor = state.players[currentIndex]
      if (!actor || actor.status !== 'ACTIVE') {
        throw new Error('Fold済みプレイヤーの手番です')
      }

      const players = [...state.players]
      const table = { ...state.table }
      const actionDetail = action.action

      switch (actionDetail.type) {
        case 'CHECK': {
          const callAmount = toCall(state, currentIndex)
          if (callAmount !== 0) {
            throw new Error('CHECKはtoCallが0のときのみ可能です')
          }
          break
        }
        case 'CALL': {
          const callAmount = toCall(state, currentIndex)
          if (callAmount <= 0) {
            throw new Error('CALLはtoCallが正のときのみ可能です')
          }
          if (actor.stack < callAmount) {
            throw new Error('CALLに必要なスタックが不足しています（サイドポット未対応）')
          }

          const updated = {
            ...actor,
            stack: actor.stack - callAmount,
            betThisRound: actor.betThisRound + callAmount,
          }

          players[currentIndex] = updated
          table.pot += callAmount
          break
        }
        case 'BET': {
          const amount = actionDetail.amount ?? 0
          if (table.currentBet !== 0) {
            throw new Error('BETは現在のベットが0のときのみ可能です')
          }
          if (amount <= 0) {
            throw new Error('BET金額が正しくありません')
          }
          if (actor.stack < amount) {
            throw new Error('BETに必要なスタックが不足しています')
          }

          const updated = {
            ...actor,
            stack: actor.stack - amount,
            betThisRound: actor.betThisRound + amount,
          }

          players[currentIndex] = updated
          table.pot += amount
          table.currentBet = updated.betThisRound
          table.lastAggressorId = actor.id
          break
        }
        case 'RAISE': {
          const raiseTo = actionDetail.raiseTo ?? 0
          if (table.currentBet <= 0) {
            throw new Error('RAISEは既にベットがあるときのみ可能です')
          }
          if (raiseTo <= table.currentBet) {
            throw new Error('RAISE額が現在のベットを上回っていません')
          }

          const delta = raiseTo - actor.betThisRound
          if (delta <= 0) {
            throw new Error('RAISE額が現在の投入額を上回っていません')
          }
          if (actor.stack < delta) {
            throw new Error('RAISEに必要なスタックが不足しています（サイドポット未対応）')
          }

          const updated = {
            ...actor,
            stack: actor.stack - delta,
            betThisRound: raiseTo,
          }

          players[currentIndex] = updated
          table.pot += delta
          table.currentBet = raiseTo
          table.lastAggressorId = actor.id
          break
        }
        case 'FOLD': {
          players[currentIndex] = { ...actor, status: 'FOLDED' }
          break
        }
        default:
          break
      }

      const activePlayers = players.filter((p) => p.status === 'ACTIVE')

      if (activePlayers.length <= 1) {
        const winnerId = activePlayers[0]?.id
        if (!winnerId) {
          throw new Error('勝者を決定できません')
        }

        return settleHandAndStartNext({ ...state, players, table }, winnerId)
      }

      table.currentBet = players.reduce(
        (max, player) => Math.max(max, player.betThisRound),
        0,
      )

      const nextPlayerId =
        findNextActivePlayerId(players, (currentIndex + 1) % players.length) ?? ''

      const allBetsMatched = activePlayers.every((player) => player.betThisRound === table.currentBet)
      const roundStartPlayerId = getRoundStartPlayerId({ players, table })
      const shouldAdvanceRound =
        allBetsMatched &&
        nextPlayerId !== '' &&
        (table.lastAggressorId
          ? nextPlayerId === table.lastAggressorId
          : nextPlayerId === roundStartPlayerId)

      if (shouldAdvanceRound) {
        return ensureNonNegative(advanceRound({ ...state, players, table }))
      }

      return ensureNonNegative({
        ...state,
        players,
        table: { ...table, currentPlayerId: nextPlayerId },
      })
    }
    default:
      return state
  }
}
