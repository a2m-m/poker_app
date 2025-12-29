import type { Game, Round, SetupConfig } from './types.ts'

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

export const createInitialGameState = (): Game => ({
  tableName: 'Pass & Play Table',
  players: [],
  table: {
    pot: 0,
    round: 'PREFLOP',
    sb: 0,
    bb: 0,
    buttonIndex: 0,
    currentBet: 0,
    currentPlayerId: '',
  },
})

export const createGameFromSetup = (setup: SetupConfig): Game => {
  const players = setup.players.map((player, index) => ({
    id: `player-${index + 1}`,
    name: player.name,
    stack: player.stack,
    betThisRound: 0,
    status: 'ACTIVE' as const,
  }))

  const baseGame: Game = {
    tableName: setup.tableName ?? 'Pass & Play Table',
    players,
    table: {
      pot: 0,
      round: 'PREFLOP',
      sb: setup.smallBlind,
      bb: setup.bigBlind,
      buttonIndex: setup.buttonIndex,
      currentBet: 0,
      currentPlayerId: '',
    },
  }

  return startRound(baseGame, 'PREFLOP')
}

export const startRound = (game: Game, round: Round): Game => {
  const resetPlayers = game.players.map((player) => ({
    ...player,
    betThisRound: 0,
  }))

  const startIndex = round === 'PREFLOP'
    ? (game.table.buttonIndex + 3) % Math.max(resetPlayers.length, 1)
    : (game.table.buttonIndex + 1) % Math.max(resetPlayers.length, 1)
  const currentPlayerId = findNextActivePlayerId(resetPlayers, startIndex) ?? ''

  return {
    ...game,
    players: resetPlayers,
    table: {
      ...game.table,
      round,
      currentBet: 0,
      currentPlayerId,
      lastAggressorId: undefined,
    },
  }
}

const applyBlind = (game: Game, playerIndex: number, amount: number): Game => {
  if (amount <= 0) return game

  const target = game.players[playerIndex]
  if (!target) return game

  if (target.stack < amount) {
    throw new Error('Blind amount exceeds player stack (サイドポット未対応)')
  }

  const updatedPlayer = {
    ...target,
    stack: target.stack - amount,
    betThisRound: target.betThisRound + amount,
  }
  const players = [...game.players]
  players[playerIndex] = updatedPlayer

  return {
    ...game,
    players,
    table: {
      ...game.table,
      pot: game.table.pot + amount,
      currentBet: Math.max(game.table.currentBet, updatedPlayer.betThisRound),
    },
  }
}

export const startHand = (game: Game): Game => {
  if (game.players.length < 2) {
    throw new Error('プレイヤーが2人以上必要です')
  }

  const preflopReady = startRound(game, 'PREFLOP')
  const sbIndex = (preflopReady.table.buttonIndex + 1) % preflopReady.players.length
  const bbIndex = (preflopReady.table.buttonIndex + 2) % preflopReady.players.length

  const afterSmallBlind = applyBlind(preflopReady, sbIndex, preflopReady.table.sb)
  const afterBigBlind = applyBlind(afterSmallBlind, bbIndex, afterSmallBlind.table.bb)

  return afterBigBlind
}
