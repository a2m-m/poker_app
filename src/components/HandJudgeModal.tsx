import { useMemo, useState } from 'react'
import Modal from './Modal.tsx'
import { judgeFromInputs } from '../utils/handJudge.ts'

export type HandJudgeModalProps = {
  open: boolean
  onClose: () => void
}

export function HandJudgeModal({ open, onClose }: HandJudgeModalProps) {
  const [boardInput, setBoardInput] = useState('')
  const [holeInput, setHoleInput] = useState('')

  const judgment = useMemo(() => judgeFromInputs(boardInput, holeInput), [boardInput, holeInput])

  return (
    <Modal title="判定ツール" open={open} onClose={onClose}>
      <p className="modal-description">共有カードと手札を入力すると、現時点の役を簡易判定します。</p>
      <div className="field">
        <label className="field__label" htmlFor="board-cards">
          共有カード（5枚）
        </label>
        <input
          id="board-cards"
          type="text"
          placeholder="例: As Kd Qh Jc 10s"
          value={boardInput}
          onChange={(event) => setBoardInput(event.target.value)}
        />
      </div>
      <div className="field" style={{ marginTop: '12px' }}>
        <label className="field__label" htmlFor="hole-cards">
          あなたの手札（2枚）
        </label>
        <input
          id="hole-cards"
          type="text"
          placeholder="例: 9h 9c"
          value={holeInput}
          onChange={(event) => setHoleInput(event.target.value)}
        />
      </div>

      {judgment.status === 'insufficient' && (
        <div className="alert alert--guide">
          <p className="alert__title">入力ガイド</p>
          <p className="alert__message">{judgment.guide}</p>
          <p className="alert__hint">例: フロップ3枚 + ターン1枚 + リバー1枚 + 手札2枚の順に入力します。</p>
        </div>
      )}

      {judgment.status === 'invalid' && (
        <div className="alert alert--error">
          <p className="alert__title">入力エラー</p>
          <ul className="alert__list">
            {judgment.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {judgment.status === 'ok' && judgment.result ? (
        <div className="judge-result">
          <p className="judge-result__label">判定結果</p>
          <p className="judge-result__value">{judgment.result.rank}</p>
          <p className="judge-result__detail">{judgment.result.detail}</p>
        </div>
      ) : null}

      <div className="modal-actions">
        <button type="button" className="ghost" onClick={onClose}>
          閉じる
        </button>
      </div>
    </Modal>
  )
}

export default HandJudgeModal
