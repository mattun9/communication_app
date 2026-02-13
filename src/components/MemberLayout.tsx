import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { MessageCircle, Calendar, User } from 'lucide-react'

const navItems = [
  { path: '/member/talk', label: 'トーク', icon: MessageCircle },
  { path: '/member/calendar', label: 'カレンダー', icon: Calendar },
  { path: '/member/mypage', label: 'マイページ', icon: User },
] as const

export function MemberLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-lg flex-col bg-bg-card shadow-sm">
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden pb-14">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg-card safe-area-bottom">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-around">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(path)
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-4 py-1 transition-colors ${
                  isActive ? 'text-primary' : 'text-text-secondary hover:text-text'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
