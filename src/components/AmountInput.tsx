type AmountInputProps = {
  label: string
  value: string
  min?: number
  max?: number
  helperText?: string
  isValid?: boolean
  confirmLabel?: string
  onChange: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
}

function AmountInput({
  label,
  value,
  min,
  max,
  helperText,
  isValid = true,
  confirmLabel = '決定',
  onChange,
  onConfirm,
  onCancel,
}: AmountInputProps) {
  return (
    <div className="amount-input">
      <div className="amount-input__header">
        <div>
          <p className="label">{label}</p>
          {helperText && <p className="amount-input__hint">{helperText}</p>}
        </div>
        <button type="button" className="ghost" onClick={onCancel}>
          キャンセル
        </button>
      </div>
      <div className="amount-input__controls">
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="button" className="primary" onClick={onConfirm} disabled={!isValid}>
          {confirmLabel}
        </button>
      </div>
      {!isValid && <p className="field__error">有効な数値を入力してください。</p>}
    </div>
  )
}

export default AmountInput
