import type { ReactNode } from 'react'

type DrawerProps = {
  open: boolean
  title: string
  children: ReactNode
}

export function Drawer({ open, title, children }: DrawerProps) {
  return (
    <aside className={`drawer ${open ? 'open' : ''}`} aria-label={title}>
      <div className="drawer-header">{title}</div>
      <div className="drawer-body">{children}</div>
    </aside>
  )
}

export default Drawer
