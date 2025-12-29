type TopBarProps = {
  tableName: string
  round: string
  pot: number
  smallBlind: number
  bigBlind: number
  buttonSeat: string
}

export function TopBar({ tableName, round, pot, smallBlind, bigBlind, buttonSeat }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar__primary">
        <div className="label">テーブル</div>
        <div className="title">{tableName}</div>
        <div className="top-bar__subtext">プレイヤーにタブレットを回して使うことを想定した横持ちレイアウト</div>
      </div>
      <div className="top-bar__metrics">
        <div className="top-bar-status">
          <div className="label">ラウンド</div>
          <div className="value">{round}</div>
        </div>
        <div className="top-bar-status">
          <div className="label">ポット</div>
          <div className="value">{pot.toLocaleString()} chips</div>
        </div>
        <div className="top-bar-status">
          <div className="label">SB / BB</div>
          <div className="value">
            {smallBlind.toLocaleString()} / {bigBlind.toLocaleString()} chips
          </div>
        </div>
        <div className="top-bar-status">
          <div className="label">BTN</div>
          <div className="value top-bar__pill">Seat {buttonSeat}</div>
        </div>
      </div>
    </header>
  )
}

export default TopBar
