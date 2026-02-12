import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard,
  Inbox,
  Megaphone,
  CalendarDays,
  ArrowRightLeft,
  LogOut,
} from 'lucide-react'

const navItems = [
  { path: '/admin/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { path: '/admin/inbox', label: 'インボックス', icon: Inbox },
  { path: '/admin/broadcasts', label: '配信管理', icon: Megaphone },
  { path: '/admin/schedule', label: 'スケジュール', icon: CalendarDays },
] as const

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, switchRole } = useAuth()

  return (
    <div className="flex h-screen bg-bg">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-bg-card">
        <div className="border-b border-border px-5 py-4">
          <h1 className="text-base font-bold text-primary">STARTUS</h1>
          <p className="text-xs text-text-secondary">管理者パネル</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(path)
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'text-text-secondary hover:bg-bg hover:text-text'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-3 py-3 space-y-1">
          <div className="px-3 py-2 text-xs text-text-secondary">
            {user?.name}
          </div>
          <button
            onClick={() => {
              switchRole('member')
              navigate('/member/talk')
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg hover:text-text"
          >
            <ArrowRightLeft size={16} />
            会員画面へ切替
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/5">
            <LogOut size={16} />
            ログアウト
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
