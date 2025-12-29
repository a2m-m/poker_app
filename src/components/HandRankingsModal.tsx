import Modal from './Modal.tsx'

const HAND_RANKINGS = [
  { rank: 1, name: 'ロイヤルフラッシュ', description: '同じスートの A-K-Q-J-10。最強の役。' },
  { rank: 2, name: 'ストレートフラッシュ', description: '同じスートで数字が5連続の役。' },
  { rank: 3, name: 'フォーカード', description: '同じ数字4枚が揃った役。' },
  { rank: 4, name: 'フルハウス', description: 'スリーカードとワンペアの組み合わせ。' },
  { rank: 5, name: 'フラッシュ', description: '同じスート5枚の役（数字の連続性は不要）。' },
  { rank: 6, name: 'ストレート', description: '数字が5連続の役（スートは不問）。' },
  { rank: 7, name: 'スリーカード', description: '同じ数字3枚が揃った役。' },
  { rank: 8, name: 'ツーペア', description: '2種類のペアが揃った役。' },
  { rank: 9, name: 'ワンペア', description: '同じ数字2枚が揃った役。' },
  { rank: 10, name: 'ハイカード', description: 'どの役にも当てはまらない場合の強さ順。' },
]

type HandRankingsModalProps = {
  open: boolean
  onClose: () => void
}

export function HandRankingsModal({ open, onClose }: HandRankingsModalProps) {
  return (
    <Modal title="役の順位" open={open} onClose={onClose}>
      <p className="modal-description">高い役から順に並んでいます。状況に応じて開いて確認してください。</p>
      <ol className="hand-rank-list">
        {HAND_RANKINGS.map((hand) => (
          <li key={hand.name} className="hand-rank-list__item">
            <span className="hand-rank-list__order">{hand.rank}</span>
            <div className="hand-rank-list__content">
              <p className="hand-rank-list__name">{hand.name}</p>
              <p className="hand-rank-list__note">{hand.description}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="modal-actions">
        <button type="button" className="primary" onClick={onClose}>
          閉じる
        </button>
      </div>
    </Modal>
  )
}

export default HandRankingsModal
