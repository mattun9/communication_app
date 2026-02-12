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
  const { user, isAdmin, switchRole } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  return (
    <div className="flex h-[100dvh] flex-col">
      <header className="sticky top-0 z-40 flex h-12 items-center border-b border-border bg-bg-card px-4">
        <h1 className="text-base font-bold text-text">マイページ</h1>
      </header>

      {/* Profile card */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-bold text-text">{user.name}</h2>
            <p className="text-xs text-text-secondary">{user.email}</p>
            <div className="mt-1 flex gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                Aクラス
              </span>
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
          <MenuItem icon={<User size={20} className="text-text-secondary" />} label="プロフィール編集" />
          <MenuItem icon={<Bell size={20} className="text-text-secondary" />} label="通知設定" />
          <MenuItem icon={<Shield size={20} className="text-text-secondary" />} label="アカウント管理" />
        </div>

        <div className="border-b border-border">
          <MenuItem icon={<ShoppingBag size={20} className="text-text-secondary" />} label="物販・グッズ購入" />
        </div>

        <div className="border-b border-border">
          <MenuItem icon={<HelpCircle size={20} className="text-text-secondary" />} label="ヘルプ・お問い合わせ" />
          <MenuItem icon={<LogOut size={20} className="text-danger" />} label="ログアウト" danger />
        </div>

        <div className="py-4 text-center">
          <p className="text-xs text-text-secondary">STARTUS v1.0.0</p>
        </div>
      </div>
    </div>
  )
}
