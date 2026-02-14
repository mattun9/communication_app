import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { MessageCircle, Calendar, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { DUMMY_BROADCASTS, DUMMY_READ_STATUSES, DUMMY_MESSAGES } from '../lib/dummyData'

const navItems = [
  { path: '/member/talk', label: 'トーク', icon: MessageCircle, badgeKey: 'talk' },
  { path: '/member/calendar', label: 'カレンダー', icon: Calendar, badgeKey: null },
  { path: '/member/mypage', label: 'マイページ', icon: User, badgeKey: null },
] as const

export function MemberLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  // 未読バッジ計算
  const getTalkBadge = (): number => {
    if (!user) return 0
    // 未読の配信数
    const userReads = new Set(DUMMY_READ_STATUSES.filter((r) => r.userId === user.uid).map((r) => r.broadcastId))
    const unreadBroadcasts = DUMMY_BROADCASTS.filter(
      (bc) =>
        bc.status === 'sent' &&
        !userReads.has(bc.id) &&
        (bc.targetType === 'all' || (bc.targetType === 'class' && bc.targetClassIds.some((id) => user.classIds.includes(id))))
    ).length
    // 未読の管理者からのメッセージ
    const unreadMessages = DUMMY_MESSAGES.filter(
      (m) => m.recipientUid === user.uid && m.senderRole === 'admin' && !m.isReadByRecipient && !m.isDeleted
    ).length
    return unreadBroadcasts + unreadMessages
  }

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-lg flex-col bg-bg-card shadow-sm">
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden pb-14">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg-card safe-area-bottom">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-around">
          {navItems.map(({ path, label, icon: Icon, badgeKey }) => {
            const isActive = location.pathname.startsWith(path)
            const badgeCount = badgeKey === 'talk' ? getTalkBadge() : 0
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-4 py-1 transition-colors ${
                  isActive ? 'text-primary' : 'text-text-secondary hover:text-text'
                }`}
              >
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {badgeCount > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-0.5 text-[9px] font-bold text-white">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </div>
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
