import { Navigate, createHashRouter } from 'react-router-dom'
import HomePage from '../pages/HomePage.tsx'
import SetupPage from '../pages/SetupPage.tsx'
import TablePage from '../pages/TablePage.tsx'

export const router = createHashRouter([
  { path: '/', element: <HomePage /> },
  { path: '/setup', element: <SetupPage /> },
  { path: '/table', element: <TablePage /> },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default router
