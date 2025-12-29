import type { ReactNode } from 'react'

type ModalProps = {
  title: string
  open: boolean
  onClose?: () => void
  children: ReactNode
}

export function Modal({ title, open, onClose, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          {onClose ? (
            <button type="button" className="ghost" onClick={onClose}>
              ×
            </button>
          ) : null}
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export default Modal
