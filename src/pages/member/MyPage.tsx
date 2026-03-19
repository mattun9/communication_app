import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  User,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ShoppingBag,
  ArrowRightLeft,
} from 'lucide-react'
import { useMemberClassrooms } from '../../hooks/useData'
import { ProfileEditSheet } from '../../components/ProfileEditSheet'
import { NotificationSettingsSheet } from '../../components/NotificationSettingsSheet'
import { AccountManagementSheet } from '../../components/AccountManagementSheet'
import { LineAccountSheet } from '../../components/LineAccountSheet'
import { LineIcon } from '../../components/LineIcon'
import { isLineLoginEnabled } from '../../lib/lineAuth'
import { useLiff } from '../../contexts/LiffContext'

interface MenuItemProps {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  danger?: boolean
  right?: React.ReactNode
}

function MenuItem({ icon, label, onClick, danger, right }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-bg ${
        danger ? 'text-danger' : 'text-text'
      }`}
    >
      {icon}
      <span className="flex-1 text-left text-sm font-medium">{label}</span>
      {right ?? (!danger && <ChevronRight size={16} className="text-text-secondary" />)}
    </button>
  )
}

export function MemberMyPage() {
  const { user, isAdmin, switchRole, logout } = useAuth()
  const { isInLiff } = useLiff()
  const navigate = useNavigate()
  const [activeSheet, setActiveSheet] = useState<'profile' | 'notification' | 'account' | 'line' | null>(null)

  const getMemberClassrooms = useMemberClassrooms()

  if (!user) return null

  const classrooms = getMemberClassrooms(user.uid)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="sticky top-0 z-40 flex h-12 items-center border-b border-border bg-bg-card px-4">
        <h1 className="text-base font-bold text-text">マイページ</h1>
      </header>

      {/* Profile card */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
              {user.name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-base font-bold text-text">{user.name}</h2>
            <p className="text-xs text-text-secondary">{user.email}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {classrooms.map((c) => (
                <span
                  key={c.id}
                  className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary"
                >
                  {c.name}
                </span>
              ))}
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${isAdmin ? 'bg-accent/10 text-accent' : 'bg-bg text-text-secondary'}`}>
                {isAdmin ? '管理者' : '会員'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* DEV: ロール切り替え */}
        <div className="border-b border-border">
          <MenuItem
            icon={<ArrowRightLeft size={20} className="text-accent" />}
            label={isAdmin ? '会員モードに切替' : '管理者モードに切替'}
            onClick={() => {
              if (isAdmin) {
                switchRole('member')
              } else {
                switchRole('admin')
                navigate('/admin/dashboard')
              }
            }}
            right={
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
                DEV
              </span>
            }
          />
        </div>

        <div className="border-b border-border">
          <MenuItem
            icon={<User size={20} className="text-text-secondary" />}
            label="プロフィール"
            onClick={() => setActiveSheet('profile')}
          />
          <MenuItem
            icon={<Bell size={20} className="text-text-secondary" />}
            label="通知設定"
            onClick={() => setActiveSheet('notification')}
          />
          {isLineLoginEnabled && !isInLiff && (
            <MenuItem
              icon={<LineIcon size={20} className="text-[#06C755]" />}
              label="LINE連携"
              onClick={() => setActiveSheet('line')}
              right={
                user.lineUserId ? (
                  <span className="rounded-full bg-[#06C755]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#06C755]">
                    連携済み
                  </span>
                ) : undefined
              }
            />
          )}
          <MenuItem
            icon={<Shield size={20} className="text-text-secondary" />}
            label="アカウント管理"
            onClick={() => setActiveSheet('account')}
          />
        </div>

        <div className="border-b border-border">
          <MenuItem icon={<ShoppingBag size={20} className="text-text-secondary" />} label="物販・グッズ購入" />
        </div>

        <div className="border-b border-border">
          <MenuItem icon={<HelpCircle size={20} className="text-text-secondary" />} label="ヘルプ・お問い合わせ" />
          {!isInLiff && (
            <MenuItem
              icon={<LogOut size={20} className="text-danger" />}
              label="ログアウト"
              danger
              onClick={() => {
                logout()
                navigate('/member/talk')
              }}
            />
          )}
        </div>

        <div className="py-4 text-center">
          <p className="text-xs text-text-secondary">STARTUS v1.0.0</p>
        </div>
      </div>

      {/* Bottom sheet modals */}
      {activeSheet === 'profile' && (
        <ProfileEditSheet onClose={() => setActiveSheet(null)} />
      )}
      {activeSheet === 'notification' && (
        <NotificationSettingsSheet onClose={() => setActiveSheet(null)} />
      )}
      {activeSheet === 'account' && (
        <AccountManagementSheet onClose={() => setActiveSheet(null)} />
      )}
      {activeSheet === 'line' && (
        <LineAccountSheet onClose={() => setActiveSheet(null)} />
      )}
    </div>
  )
}
