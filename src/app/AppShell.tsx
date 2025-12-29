import { RouterProvider } from 'react-router-dom'
import router from './router.tsx'
import '../App.css'

export function AppShell() {
  return (
    <div className="app-shell">
      <RouterProvider router={router} />
    </div>
  )
}

export default AppShell
