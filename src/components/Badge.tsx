export type BadgeVariant = 'default' | 'accent' | 'muted' | 'danger'

export type BadgeProps = {
  label: string
  variant?: BadgeVariant
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return <span className={`badge badge--${variant}`}>{label}</span>
}

export default Badge
