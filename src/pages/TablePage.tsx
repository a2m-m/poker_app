import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar.tsx'
import UtilityActions, { type UtilityActionKey } from '../components/UtilityActions.tsx'
import ActionPanel from '../components/ActionPanel.tsx'
import ShowdownWinnerModal from '../components/ShowdownWinnerModal.tsx'
import { useGameState } from '../app/GameContext.tsx'
import { getCurrentPlayer, toCall } from '../domain/selectors.ts'
import type { Action, Round } from '../domain/types.ts'

function TablePage() {
  const { state, dispatch } = useGameState()
  const [lastUtilityAction, setLastUtilityAction] = useState('未操作')
  const [lastAction, setLastAction] = useState('まだ行動がありません')

  const currentPlayer = useMemo(() => getCurrentPlayer(state), [state])
  const activeShowdownPlayers = useMemo(
    () => state.players.filter((player) => player.status === 'ACTIVE'),
    [state.players],
  )
  const callAmount = useMemo(
    () => (currentPlayer ? toCall(state, currentPlayer) : 0),
    [currentPlayer, state],
  )

  const isShowdown = state.table.round === 'SHOWDOWN'
  const showdownPot = state.table.pot

  const tableSnapshot = useMemo(
    () => {
      const roundLabel: Record<Round, string> = {
        PREFLOP: 'Preflop',
        FLOP: 'Flop',
        TURN: 'Turn',
        RIVER: 'River',
        SHOWDOWN: 'Showdown',
      }

      return {
        tableName: state.tableName,
        round: roundLabel[state.table.round],
        pot: state.table.pot,
        smallBlind: state.table.sb,
        bigBlind: state.table.bb,
        buttonSeat: state.players.length > 0 ? String(state.table.buttonIndex + 1) : '-',
      }
    },
    [state],
  )

  const roundGuide = useMemo(() => {
    switch (state.table.round) {
      case 'FLOP':
        return 'フロップを3枚めくってください'
      case 'TURN':
        return 'ターンを1枚めくってください'
      case 'RIVER':
        return 'リバーを1枚めくってください'
      default:
        return ''
    }
  }, [state.table.round])

  const handleUtilitySelect = (action: UtilityActionKey) => {
    const actionLabel: Record<UtilityActionKey, string> = {
      logs: 'ログ',
      handRanks: '役一覧',
      judge: '判定ツール',
      settings: '設定',
    }
    setLastUtilityAction(`${actionLabel[action]}を開く準備ができています`)
  }

  const handleAction = (action: Action) => {
    const actor = currentPlayer?.name ?? '不明なプレイヤー'
    const actionLabel: Record<Action['type'], string> = {
      CHECK: 'チェック',
      CALL: `コール（${callAmount}）`,
      BET: `ベット（${action.amount ?? '-'}）`,
      RAISE: `レイズ（${action.raiseTo ?? '-'}）`,
      FOLD: 'フォールド',
    }

    try {
      dispatch({ type: 'ACTION_APPLY', payload: { type: 'PLAYER_ACTION', action } })
      setLastAction(`${actor} が ${actionLabel[action.type]} を選択しました`)
    } catch (error) {
      const message = error instanceof Error ? error.message : '不明なエラーが発生しました'
      setLastAction(`アクションに失敗しました: ${message}`)
    }
  }

  const handleWinnerSelect = (winnerId: string) => {
    const winnerName = activeShowdownPlayers.find((player) => player.id === winnerId)?.name

    try {
      dispatch({ type: 'ACTION_APPLY', payload: { type: 'RESOLVE_SHOWDOWN', winnerId } })
      setLastAction(`${winnerName ?? '選択されたプレイヤー'} がポットを獲得しました`)
    } catch (error) {
      const message = error instanceof Error ? error.message : '不明なエラーが発生しました'
      setLastAction(`勝者の決定に失敗しました: ${message}`)
    }
  }

  return (
    <div className="table-layout">
      <TopBar
        tableName={tableSnapshot.tableName}
        round={tableSnapshot.round}
        pot={tableSnapshot.pot}
        smallBlind={tableSnapshot.smallBlind}
        bigBlind={tableSnapshot.bigBlind}
        buttonSeat={tableSnapshot.buttonSeat}
      />

      <div className="table-layout__body">
        <section className="table-layout__canvas">
          <div className="table-placeholder">
            <div>
              <p className="eyebrow">メインエリア</p>
              <h1>手番入力のテストキャンバス</h1>
              <p className="lede">
                プレイヤーグリッドの代わりに、現在の手番と To Call を確認できる ActionPanel を配置しています。
              </p>
              {roundGuide && (
                <div className="stage-guide" role="status">
                  <p className="label">ガイド</p>
                  <p className="stage-guide__message">{roundGuide}</p>
                </div>
              )}
            </div>
            <div className="placeholder-actions">
              <Link to="/" className="ghost">
                ホームに戻る
              </Link>
              <Link to="/setup" className="primary">
                セットアップへ
              </Link>
            </div>
          </div>

          <ActionPanel onAction={handleAction} />
        </section>
        <aside className="table-layout__rail">
          <UtilityActions onSelect={handleUtilitySelect} />
          <div className="utility-status">
            <p className="label">最後に選んだツール</p>
            <p className="value">{lastUtilityAction}</p>
          </div>
          <div className="utility-status">
            <p className="label">最後のアクション</p>
            <p className="value">{lastAction}</p>
          </div>
        </aside>
      </div>

      <ShowdownWinnerModal
        open={isShowdown && activeShowdownPlayers.length > 0}
        players={activeShowdownPlayers}
        pot={showdownPot}
        onConfirm={handleWinnerSelect}
      />
    </div>
  )
}

export default TablePage
