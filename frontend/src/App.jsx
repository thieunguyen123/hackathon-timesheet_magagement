import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout, ProtectedRoute } from './components/layout'
import { ROUTES } from './constants'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AttendancePage from './pages/AttendancePage'
import MyRequestsPage from './pages/MyRequestsPage'
import ApprovalsPage from './pages/ApprovalsPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminReportsPage from './pages/AdminReportsPage'

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path={ROUTES.ATTENDANCE} element={<AttendancePage />} />
          <Route path={ROUTES.REQUESTS} element={<MyRequestsPage />} />
          <Route element={<ProtectedRoute roles={['admin', 'manager']} />}>
            <Route path={ROUTES.APPROVALS} element={<ApprovalsPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
            <Route path={ROUTES.ADMIN_REPORTS} element={<AdminReportsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  )
}
