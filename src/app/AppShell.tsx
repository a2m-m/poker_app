import { RouterProvider } from 'react-router-dom'
import { GameProvider } from './GameContext.tsx'
import router from './router.tsx'
import '../App.css'

export function AppShell() {
  return (
    <GameProvider>
      <div className="app-shell">
        <div className="app-shell__backdrop" />
        <div className="app-shell__frame">
          <RouterProvider router={router} />
        </div>
      </div>
    </GameProvider>
  )
}

export default AppShell
