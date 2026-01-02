import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGameState } from '../app/GameContext.tsx'
import type { SetupConfig } from '../domain/types.ts'

type PlayerDraft = {
  name: string
  stack: string
}

const MIN_PLAYERS = 2
const MAX_PLAYERS = 9

function SetupPage() {
  const navigate = useNavigate()
  const { dispatch } = useGameState()
  const [playerCount, setPlayerCount] = useState(6)
  const [players, setPlayers] = useState<PlayerDraft[]>(() =>
    Array.from({ length: MAX_PLAYERS }, () => ({ name: '', stack: '' })),
  )
  const [smallBlind, setSmallBlind] = useState('')
  const [bigBlind, setBigBlind] = useState('')
  const [buttonSeat, setButtonSeat] = useState('')

  const activePlayers = useMemo(() => players.slice(0, playerCount), [players, playerCount])

  const handlePlayerChange = (index: number, field: keyof PlayerDraft, value: string) => {
    setPlayers((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const incrementPlayers = () => {
    setPlayerCount((count) => {
      const next = Math.min(MAX_PLAYERS, count + 1)
      if (buttonSeat && Number(buttonSeat) > next) {
        setButtonSeat('')
      }
      return next
    })
  }

  const decrementPlayers = () => {
    setPlayerCount((count) => {
      const next = Math.max(MIN_PLAYERS, count - 1)
      if (buttonSeat && Number(buttonSeat) > next) {
        setButtonSeat('')
      }
      return next
    })
  }

  const selectRandomButtonSeat = () => {
    const seat = Math.floor(Math.random() * playerCount) + 1
    setButtonSeat(String(seat))
  }

  const smallBlindValue = Number(smallBlind)
  const bigBlindValue = Number(bigBlind)

  const isSmallBlindValid = smallBlind.trim() !== '' && smallBlindValue > 0
  const isBigBlindValid = bigBlind.trim() !== '' && bigBlindValue > 0 && bigBlindValue >= smallBlindValue
  const arePlayersValid = activePlayers.every(
    (player) =>
      player.name.trim() !== '' &&
      Number(player.stack) > 0 &&
      (!isBigBlindValid || Number(player.stack) >= bigBlindValue),
  )
  const isButtonSeatValid = buttonSeat !== '' && Number(buttonSeat) >= 1 && Number(buttonSeat) <= playerCount

  const canStart = isSmallBlindValid && isBigBlindValid && arePlayersValid && isButtonSeatValid

  const startTable = () => {
    if (!canStart) return
    const setupConfig: SetupConfig = {
      tableName: undefined,
      smallBlind: Number(smallBlind),
      bigBlind: Number(bigBlind),
      buttonIndex: Number(buttonSeat) - 1,
      players: activePlayers.map((player) => ({
        name: player.name.trim(),
        stack: Number(player.stack),
      })),
    }

    dispatch({ type: 'GAME_CREATE', payload: setupConfig })
    dispatch({ type: 'HAND_START' })
    navigate('/table')
  }

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">/setup</p>
        <h1>セットアップ</h1>
        <p className="lede">人数、プレイヤー情報、ブラインドを入力してテーブルを開始します。</p>
      </header>

      <div className="setup-grid">
        <section className="setup-card">
          <div className="setup-card__header">
            <div>
              <p className="eyebrow">STEP 1</p>
              <h2>人数とプレイヤー情報</h2>
              <p className="lede">2〜9人まで対応しています。名前とスタックは必須です。</p>
            </div>
            <div className="stepper" aria-label="プレイヤー人数">
              <button type="button" onClick={decrementPlayers} disabled={playerCount <= MIN_PLAYERS}>
                −
              </button>
              <div className="stepper__value">{playerCount} 人</div>
              <button type="button" onClick={incrementPlayers} disabled={playerCount >= MAX_PLAYERS}>
                ＋
              </button>
            </div>
          </div>

          <div className="player-list">
            {activePlayers.map((player, index) => (
              <div key={index} className="player-row">
                <div className="seat-tag">Seat {index + 1}</div>
                <div className="field">
                  <label className="field__label" htmlFor={`player-name-${index}`}>
                    名前
                  </label>
                  <input
                    id={`player-name-${index}`}
                    type="text"
                    value={player.name}
                    onChange={(event) => handlePlayerChange(index, 'name', event.target.value)}
                    placeholder="例: Player A"
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor={`player-stack-${index}`}>
                    スタック
                  </label>
                  <input
                    id={`player-stack-${index}`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={player.stack}
                    onChange={(event) => handlePlayerChange(index, 'stack', event.target.value)}
                    placeholder="例: 1000"
                  />
                  {isBigBlindValid && Number(player.stack) > 0 && Number(player.stack) < bigBlindValue && (
                    <p className="field__error">BB 以上のスタックが必要です。</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="setup-card">
          <div className="setup-card__header">
            <div>
              <p className="eyebrow">STEP 2</p>
              <h2>ブラインドとボタン</h2>
              <p className="lede">SB/BB を設定し、初手のボタン位置を決めます。</p>
            </div>
          </div>

          <div className="blind-grid">
            <div className="field">
              <label className="field__label" htmlFor="small-blind">
                スモールブラインド
              </label>
              <input
                id="small-blind"
                type="number"
                inputMode="numeric"
                min={1}
                value={smallBlind}
                onChange={(event) => setSmallBlind(event.target.value)}
                placeholder="例: 50"
              />
              {!isSmallBlindValid && smallBlind !== '' && (
                <p className="field__error">正の数値を入力してください。</p>
              )}
            </div>
            <div className="field">
              <label className="field__label" htmlFor="big-blind">
                ビッグブラインド
              </label>
              <input
                id="big-blind"
                type="number"
                inputMode="numeric"
                min={1}
                value={bigBlind}
                onChange={(event) => setBigBlind(event.target.value)}
                placeholder="例: 100"
              />
              {!isBigBlindValid && bigBlind !== '' && (
                <p className="field__error">SB 以上の正の数値を入力してください。</p>
              )}
            </div>
          </div>

          <div className="button-seat">
            <div className="button-seat__header">
              <div>
                <p className="label">ボタン初期位置</p>
                <p className="value">Seat を選ぶかランダムに決定できます。</p>
              </div>
              <button type="button" className="ghost" onClick={selectRandomButtonSeat}>
                ランダムに決定
              </button>
            </div>
            <div className="seat-grid" role="group" aria-label="ボタン位置の選択">
              {Array.from({ length: playerCount }).map((_, index) => {
                const seatNumber = index + 1
                const isActive = buttonSeat === String(seatNumber)
                return (
                  <button
                    key={seatNumber}
                    type="button"
                    className={`seat-chip ${isActive ? 'active' : ''}`}
                    onClick={() => setButtonSeat(String(seatNumber))}
                  >
                    Seat {seatNumber}
                  </button>
                )
              })}
            </div>
            {!isButtonSeatValid && <p className="field__error">ボタン位置を選択してください。</p>}
          </div>
        </section>
      </div>

      <div className="cta-row">
        <Link to="/" className="ghost">
          ホームに戻る
        </Link>
        <button type="button" className="primary" onClick={startTable} disabled={!canStart}>
          テーブルを開始
        </button>
      </div>
    </div>
  )
}

export default SetupPage
