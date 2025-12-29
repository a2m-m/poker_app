export type Round = 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN'

export type PlayerStatus = 'ACTIVE' | 'FOLDED'

export type ActionType = 'CHECK' | 'CALL' | 'BET' | 'RAISE' | 'FOLD'

export type Player = {
  id: string
  name: string
  stack: number // >=0
  betThisRound: number // >=0
  status: PlayerStatus
}

export type Table = {
  pot: number // >=0
  round: Round
  sb: number
  bb: number
  buttonIndex: number // 0..n-1
  currentBet: number // max betThisRound in current round
  currentPlayerId: string
  lastAggressorId?: string
}

export type Game = {
  tableName: string
  players: Player[]
  table: Table
}

export type Action = {
  type: ActionType
  amount?: number // BET amount
  raiseTo?: number // RAISE target total betThisRound
}

export type SetupPlayer = {
  name: string
  stack: number
}

export type SetupConfig = {
  tableName?: string
  smallBlind: number
  bigBlind: number
  buttonIndex: number
  players: SetupPlayer[]
}
