import { RouterProvider } from 'react-router-dom'
import router from './router.tsx'
import '../App.css'

export function AppShell() {
  return (
    <div className="app-shell">
      <div className="app-shell__backdrop" />
      <div className="app-shell__frame">
        <RouterProvider router={router} />
      </div>
    </div>
  )
}

export default AppShell
