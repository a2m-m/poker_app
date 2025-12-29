export type CardSuit = 'S' | 'H' | 'D' | 'C'

export type Card = {
  rank: number
  suit: CardSuit
  label: string
}

export type JudgmentStatus = 'insufficient' | 'invalid' | 'ok'

export type JudgmentResult = {
  status: JudgmentStatus
  guide: string
  errors: string[]
  result?: {
    rank: string
    detail: string
  }
}

const RANK_MAP: Record<string, number> = {
  A: 14,
  K: 13,
  Q: 12,
  J: 11,
  T: 10,
  '10': 10,
  9: 9,
  8: 8,
  7: 7,
  6: 6,
  5: 5,
  4: 4,
  3: 3,
  2: 2,
}

const SUIT_MAP: Record<string, CardSuit> = {
  S: 'S',
  H: 'H',
  D: 'D',
  C: 'C',
}

const SUIT_LABEL: Record<CardSuit, string> = {
  S: 'スペード',
  H: 'ハート',
  D: 'ダイヤ',
  C: 'クラブ',
}

const RANK_LABEL: Record<number, string> = {
  14: 'A',
  13: 'K',
  12: 'Q',
  11: 'J',
  10: '10',
  9: '9',
  8: '8',
  7: '7',
  6: '6',
  5: '5',
  4: '4',
  3: '3',
  2: '2',
}

function parseCardSymbol(symbol: string): Card | null {
  const trimmed = symbol.trim().toUpperCase()
  if (!trimmed) return null

  const match = trimmed.match(/^(10|[2-9TJQKA])([SHDC])$/)
  if (!match) return null

  const [, rankSymbol, suitSymbol] = match
  const rank = RANK_MAP[rankSymbol]
  const suit = SUIT_MAP[suitSymbol]

  if (!rank || !suit) return null

  return { rank, suit, label: `${rankSymbol}${suitSymbol}` }
}

function tokenizeCards(input: string): { cards: Card[]; errors: string[] } {
  const tokens = input
    .split(/[,\s]+/)
    .map((token) => token.trim())
    .filter(Boolean)

  const errors: string[] = []
  const cards: Card[] = []

  tokens.forEach((token) => {
    const parsed = parseCardSymbol(token)
    if (!parsed) {
      errors.push(`カード表記が正しくありません: "${token}"`)
      return
    }

    cards.push(parsed)
  })

  return { cards, errors }
}

function hasDuplicateCards(cards: Card[]): string[] {
  const seen = new Set<string>()
  const duplicates: string[] = []

  cards.forEach((card) => {
    const key = `${card.rank}${card.suit}`
    if (seen.has(key)) {
      duplicates.push(card.label)
    } else {
      seen.add(key)
    }
  })

  return duplicates
}

function findStraightHighCard(ranks: number[]): number | null {
  const uniqueRanks = Array.from(new Set(ranks)).sort((a, b) => b - a)

  // Wheel straight (A-2-3-4-5)
  if (uniqueRanks.includes(14)) uniqueRanks.push(1)

  let consecutive = 1
  for (let i = 0; i < uniqueRanks.length - 1; i += 1) {
    if (uniqueRanks[i] - 1 === uniqueRanks[i + 1]) {
      consecutive += 1
      if (consecutive >= 5) return uniqueRanks[i - 3]
    } else {
      consecutive = 1
    }
  }

  return null
}

function evaluateSevenCardHand(cards: Card[]): { rank: string; detail: string } {
  const ranks = cards.map((card) => card.rank)
  const suits = cards.map((card) => card.suit)

  const rankCount = ranks.reduce<Record<number, number>>((acc, rank) => {
    acc[rank] = (acc[rank] ?? 0) + 1
    return acc
  }, {})

  const suitCount = suits.reduce<Record<CardSuit, number>>((acc, suit) => {
    acc[suit] = (acc[suit] ?? 0) + 1
    return acc
  }, { S: 0, H: 0, D: 0, C: 0 })

  const flushSuit = (Object.keys(suitCount) as CardSuit[]).find((suit) => suitCount[suit] >= 5)
  const straightHigh = findStraightHighCard(ranks)

  if (flushSuit) {
    const flushRanks = cards
      .filter((card) => card.suit === flushSuit)
      .map((card) => card.rank)
    const straightFlushHigh = findStraightHighCard(flushRanks)
    if (straightFlushHigh) {
      return {
        rank: 'ストレートフラッシュ',
        detail: `${RANK_LABEL[Math.max(straightFlushHigh, 5)]}ハイのストレートフラッシュ`,
      }
    }
  }

  const quads = Object.entries(rankCount)
    .filter(([, count]) => count === 4)
    .map(([rank]) => Number(rank))
    .sort((a, b) => b - a)

  if (quads.length > 0) {
    return { rank: 'フォーカード', detail: `${RANK_LABEL[quads[0]]}の4カード` }
  }

  const trips = Object.entries(rankCount)
    .filter(([, count]) => count === 3)
    .map(([rank]) => Number(rank))
    .sort((a, b) => b - a)
  const pairs = Object.entries(rankCount)
    .filter(([, count]) => count === 2)
    .map(([rank]) => Number(rank))
    .sort((a, b) => b - a)

  if (trips.length > 0 && (pairs.length > 0 || trips.length >= 2)) {
    const tripRank = trips[0]
    const pairRank = pairs[0] ?? trips[1]
    return { rank: 'フルハウス', detail: `${RANK_LABEL[tripRank]}と${RANK_LABEL[pairRank]}のフルハウス` }
  }

  if (flushSuit) {
    return { rank: 'フラッシュ', detail: `${SUIT_LABEL[flushSuit]}のフラッシュ` }
  }

  if (straightHigh) {
    return { rank: 'ストレート', detail: `${RANK_LABEL[Math.max(straightHigh, 5)]}ハイのストレート` }
  }

  if (trips.length > 0) {
    return { rank: 'スリーカード', detail: `${RANK_LABEL[trips[0]]}のスリーカード` }
  }

  if (pairs.length >= 2) {
    return { rank: 'ツーペア', detail: `${RANK_LABEL[pairs[0]]}と${RANK_LABEL[pairs[1]]}のツーペア` }
  }

  if (pairs.length === 1) {
    return { rank: 'ワンペア', detail: `${RANK_LABEL[pairs[0]]}のワンペア` }
  }

  const highest = Math.max(...ranks)
  return { rank: 'ハイカード', detail: `${RANK_LABEL[highest]}ハイ` }
}

export function judgeFromInputs(boardInput: string, holeInput: string): JudgmentResult {
  const { cards: boardCards, errors: boardErrors } = tokenizeCards(boardInput)
  const { cards: holeCards, errors: holeErrors } = tokenizeCards(holeInput)

  const errors = [...boardErrors, ...holeErrors]

  if (boardCards.length > 5) {
    errors.push('共有カードは最大5枚まで入力してください')
  }

  if (holeCards.length > 2) {
    errors.push('手札は最大2枚まで入力してください')
  }

  const duplicates = hasDuplicateCards([...boardCards, ...holeCards])
  if (duplicates.length > 0) {
    errors.push(`重複したカードがあります: ${duplicates.join(', ')}`)
  }

  if (errors.length > 0) {
    return { status: 'invalid', guide: 'カード表記を修正してください', errors }
  }

  if (boardCards.length < 5 || holeCards.length < 2) {
    const missingBoard = Math.max(0, 5 - boardCards.length)
    const missingHole = Math.max(0, 2 - holeCards.length)

    const missingParts = [] as string[]
    if (missingBoard > 0) missingParts.push(`共有カードが${missingBoard}枚不足しています`)
    if (missingHole > 0) missingParts.push(`手札が${missingHole}枚不足しています`)

    const guide =
      missingParts.join('、') || 'フロップ・ターン・リバーと手札をすべて入力すると判定できます'

    return { status: 'insufficient', guide, errors: [] }
  }

  const board = boardCards.slice(0, 5)
  const hole = holeCards.slice(0, 2)
  const result = evaluateSevenCardHand([...board, ...hole])

  return { status: 'ok', guide: '役の概要を表示しています', errors: [], result }
}

export default judgeFromInputs
