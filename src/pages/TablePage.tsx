import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar.tsx'
import UtilityActions, { type UtilityActionKey } from '../components/UtilityActions.tsx'
import { useGameState } from '../app/GameContext.tsx'
import type { Round } from '../domain/types.ts'

function TablePage() {
  const { state } = useGameState()
  const [lastUtilityAction, setLastUtilityAction] = useState('未操作')

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

  const handleUtilitySelect = (action: UtilityActionKey) => {
    const actionLabel: Record<UtilityActionKey, string> = {
      logs: 'ログ',
      handRanks: '役一覧',
      judge: '判定ツール',
      settings: '設定',
    }
    setLastUtilityAction(`${actionLabel[action]}を開く準備ができています`)
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
              <h1>ディーラーの進行を支えるキャンバス</h1>
              <p className="lede">
                プレイヤーグリッドやアクションパネルなどのメイン UI はここに配置されます。
              </p>
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
        </section>
        <aside className="table-layout__rail">
          <UtilityActions onSelect={handleUtilitySelect} />
          <div className="utility-status">
            <p className="label">最後に選んだツール</p>
            <p className="value">{lastUtilityAction}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default TablePage
