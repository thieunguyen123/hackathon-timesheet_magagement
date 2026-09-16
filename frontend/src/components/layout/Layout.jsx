import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROLES, ROUTES } from '../../constants'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = async () => {
    await logout()
    navigate(ROUTES.LOGIN)
  }

  const roleLabel = ROLES[user?.role]?.label || user?.role

  return (
    <div className="flex min-h-screen max-[768px]:flex-col">
      <Sidebar user={user} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar user={user} roleLabel={roleLabel} onLogout={onLogout} />
        <main className="flex-1 bg-[#f4f6fb] p-6 max-[768px]:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
