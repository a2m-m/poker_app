import { useMemo, useState } from 'react'
import ActionPanel from '../components/ActionPanel.tsx'
import ConfirmDialog from '../components/ConfirmDialog.tsx'
import PlayerGrid from '../components/PlayerGrid.tsx'
import TopBar from '../components/TopBar.tsx'

function TablePage() {
  const [lastAction, setLastAction] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const potSize = useMemo(() => 2400, [])

  return (
    <div className="page table-page">
      <TopBar tableName="Demo Table" stage="Preflop" pot={potSize} />

      <PlayerGrid />

      <ActionPanel
        onAction={(action) => {
          setLastAction(action)
          setShowConfirm(true)
        }}
      />

      <ConfirmDialog
        open={showConfirm}
        title="アクションを記録"
        description={
          lastAction
            ? `${lastAction} を選択しました。`
            : 'アクションを選択してください。'
        }
        confirmLabel="閉じる"
        onConfirm={() => setShowConfirm(false)}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}

export default TablePage
