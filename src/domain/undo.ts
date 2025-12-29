import type { Game, Player, PlayerStatus, Table } from './types.ts'

type PlayerDiff = {
  id: Player['id']
  prevStack?: Player['stack']
  prevBetThisRound?: Player['betThisRound']
  prevStatus?: PlayerStatus
}

type TableDiff = Partial<Pick<Table, 'pot' | 'round' | 'currentBet' | 'currentPlayerId' | 'lastAggressorId' | 'buttonIndex'>>

export type HistoryEntry = {
  tableName?: Game['tableName']
  table: TableDiff
  players: PlayerDiff[]
}

const hasPlayerChange = (diff: PlayerDiff): boolean =>
  diff.prevStack !== undefined || diff.prevBetThisRound !== undefined || diff.prevStatus !== undefined

const hasTableChange = (diff: TableDiff): boolean => Object.keys(diff).length > 0

export const createHistoryEntry = (before: Game, after: Game): HistoryEntry | null => {
  const players = before.players
    .map((player) => {
      const next = after.players.find((candidate) => candidate.id === player.id)
      if (!next) return null

      const playerDiff: PlayerDiff = { id: player.id }
      if (player.stack !== next.stack) playerDiff.prevStack = player.stack
      if (player.betThisRound !== next.betThisRound) playerDiff.prevBetThisRound = player.betThisRound
      if (player.status !== next.status) playerDiff.prevStatus = player.status

      return hasPlayerChange(playerDiff) ? playerDiff : null
    })
    .filter((diff): diff is PlayerDiff => diff !== null)

  const table: TableDiff = {}
  if (before.table.pot !== after.table.pot) table.pot = before.table.pot
  if (before.table.round !== after.table.round) table.round = before.table.round
  if (before.table.currentBet !== after.table.currentBet) table.currentBet = before.table.currentBet
  if (before.table.currentPlayerId !== after.table.currentPlayerId) table.currentPlayerId = before.table.currentPlayerId
  if (before.table.lastAggressorId !== after.table.lastAggressorId) table.lastAggressorId = before.table.lastAggressorId
  if (before.table.buttonIndex !== after.table.buttonIndex) table.buttonIndex = before.table.buttonIndex

  const tableName = before.tableName !== after.tableName ? before.tableName : undefined

  if (players.length === 0 && !hasTableChange(table) && tableName === undefined) return null

  return { players, table, tableName }
}

export const pushHistory = (
  history: HistoryEntry[],
  entry: HistoryEntry | null,
): HistoryEntry[] => (entry ? [...history, entry] : history)

export const undoLastAction = (
  game: Game,
  history: HistoryEntry[],
): { game: Game; history: HistoryEntry[] } => {
  if (history.length === 0) return { game, history }

  const nextHistory = [...history]
  const lastEntry = nextHistory.pop()
  if (!lastEntry) return { game, history }

  const restoredPlayers = game.players.map((player) => {
    const diff = lastEntry.players.find((candidate) => candidate.id === player.id)
    if (!diff) return player

    return {
      ...player,
      stack: diff.prevStack ?? player.stack,
      betThisRound: diff.prevBetThisRound ?? player.betThisRound,
      status: diff.prevStatus ?? player.status,
    }
  })

  const restoredGame: Game = {
    ...game,
    tableName: lastEntry.tableName ?? game.tableName,
    players: restoredPlayers,
    table: {
      ...game.table,
      ...lastEntry.table,
    },
  }

  return { game: restoredGame, history: nextHistory }
}
