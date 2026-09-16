import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../constants'
import { Loading } from '../ui'

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading />
  }
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }
  return <Outlet />
}
