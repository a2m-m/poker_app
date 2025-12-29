type TopBarProps = {
  tableName: string
  stage: string
  pot: number
}

export function TopBar({ tableName, stage, pot }: TopBarProps) {
  return (
    <header className="top-bar">
      <div>
        <div className="label">テーブル</div>
        <div className="title">{tableName}</div>
      </div>
      <div className="top-bar-status">
        <div className="label">ラウンド</div>
        <div className="value">{stage}</div>
      </div>
      <div className="top-bar-status">
        <div className="label">ポット</div>
        <div className="value">{pot.toLocaleString()} chips</div>
      </div>
    </header>
  )
}

export default TopBar
