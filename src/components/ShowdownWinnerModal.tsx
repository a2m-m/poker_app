import { useState } from 'react'
import type { Player } from '../domain/types.ts'
import Modal from './Modal.tsx'

type ShowdownWinnerModalProps = {
  open: boolean
  players: Player[]
  pot: number
  onConfirm: (winnerId: string) => void
}

function ShowdownWinnerModal({ open, players, pot, onConfirm }: ShowdownWinnerModalProps) {
  const [selectedWinnerId, setSelectedWinnerId] = useState('')

  const defaultWinnerId = players[0]?.id ?? ''
  const isSelectedIdValid = players.some((player) => player.id === selectedWinnerId)
  const effectiveSelectedWinnerId = isSelectedIdValid ? selectedWinnerId : defaultWinnerId

  const handleConfirm = () => {
    if (!effectiveSelectedWinnerId) return
    onConfirm(effectiveSelectedWinnerId)
  }

  return (
    <Modal title="ショーダウン" open={open}>
      <div className="showdown-body">
        <p className="modal-description">ポット {pot} を獲得するプレイヤーを選択してください。</p>
        <div className="winner-list" role="list">
          {players.map((player) => {
            const isSelected = player.id === effectiveSelectedWinnerId
            return (
              <button
                key={player.id}
                type="button"
                className={`winner-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => setSelectedWinnerId(player.id)}
                role="listitem"
              >
                <div className="winner-card__header">
                  <p className="winner-card__name">{player.name}</p>
                  <span className="badge">{player.status === 'ACTIVE' ? '参加中' : 'フォールド'}</span>
                </div>
                <p className="winner-card__stack">スタック: {player.stack}</p>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className="primary winner-submit"
          disabled={!effectiveSelectedWinnerId}
          onClick={handleConfirm}
        >
          勝者に配分する
        </button>
      </div>
    </Modal>
  )
}

export default ShowdownWinnerModal
