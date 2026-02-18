import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard,
  MessageCircle,
  Megaphone,
  CalendarDays,
  Users,
  School,
  ArrowRightLeft,
  LogOut,
} from 'lucide-react'
import { useMessages } from '../hooks/useData'
import { Logo } from './Logo'

const navItems = [
  { path: '/admin/dashboard', label: 'ダッシュボード', icon: LayoutDashboard, badgeKey: null },
  { path: '/admin/inbox', label: 'チャット', icon: MessageCircle, badgeKey: 'chat' },
  { path: '/admin/broadcasts', label: '配信管理', icon: Megaphone, badgeKey: null },
  { path: '/admin/schedule', label: 'スケジュール', icon: CalendarDays, badgeKey: null },
  { path: '/admin/members', label: 'メンバー', icon: Users, badgeKey: null },
  { path: '/admin/classrooms', label: '教室管理', icon: School, badgeKey: null },
] as const

function AdminLayoutInner() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, switchRole, logout } = useAuth()
  const { getUnreadCountFromMembers } = useMessages()

  const getBadgeCount = (key: string | null): number => {
    if (key === 'chat') return getUnreadCountFromMembers()
    return 0
  }

  return (
    <div className="flex h-screen bg-bg">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-bg-card">
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <Logo size={32} />
          <div>
            <p className="text-sm font-bold text-text leading-none">STARTUS</p>
            <p className="mt-0.5 text-[10px] text-text-secondary leading-none">管理者パネル</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ path, label, icon: Icon, badgeKey }) => {
            const isActive = location.pathname.startsWith(path)
            const badgeCount = getBadgeCount(badgeKey)
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
                <div className="relative">
                  <Icon size={18} />
                  {badgeCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-0.5 text-[9px] font-bold text-white">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </div>
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
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/5"
          >
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

export function AdminLayout() {
  return <AdminLayoutInner />
}
