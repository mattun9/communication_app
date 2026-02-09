import { useLocation, useNavigate } from 'react-router-dom'
import { MessageCircle, Calendar, FileText, User } from 'lucide-react'

const navItems = [
  { path: '/talk', label: 'トーク', icon: MessageCircle },
  { path: '/calendar', label: 'カレンダー', icon: Calendar },
  { path: '/request', label: '申請', icon: FileText },
  { path: '/mypage', label: 'マイページ', icon: User },
] as const

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg-card safe-area-bottom">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname.startsWith(path)
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-text'
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
  )
}
