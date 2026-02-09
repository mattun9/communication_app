import { Header } from '../components/Header'
import {
  ChevronRight,
  User,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ShoppingBag,
} from 'lucide-react'

const DUMMY_USER = {
  name: '山田 太郎',
  email: 'yamada@example.com',
  className: 'Aクラス',
  role: 'member' as const,
  childName: '山田 花子',
}

interface MenuItemProps {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  danger?: boolean
}

function MenuItem({ icon, label, onClick, danger }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-bg ${
        danger ? 'text-danger' : 'text-text'
      }`}
    >
      {icon}
      <span className="flex-1 text-left text-sm font-medium">{label}</span>
      {!danger && <ChevronRight size={16} className="text-text-secondary" />}
    </button>
  )
}

export function MyPage() {
  return (
    <div className="flex h-full flex-col">
      <Header title="マイページ" />

      {/* Profile card */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
            {DUMMY_USER.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-text">{DUMMY_USER.name}</h2>
            <p className="text-sm text-text-secondary">{DUMMY_USER.email}</p>
            <div className="mt-1 flex gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {DUMMY_USER.className}
              </span>
              <span className="rounded-full bg-bg px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                お子様: {DUMMY_USER.childName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu sections */}
      <div className="space-y-2 pt-2">
        <div className="border-b border-border">
          <MenuItem
            icon={<User size={20} className="text-text-secondary" />}
            label="プロフィール編集"
          />
          <MenuItem
            icon={<Bell size={20} className="text-text-secondary" />}
            label="通知設定"
          />
          <MenuItem
            icon={<Shield size={20} className="text-text-secondary" />}
            label="アカウント管理"
          />
        </div>

        <div className="border-b border-border">
          <MenuItem
            icon={<ShoppingBag size={20} className="text-text-secondary" />}
            label="物販・グッズ購入"
          />
        </div>

        <div className="border-b border-border">
          <MenuItem
            icon={<HelpCircle size={20} className="text-text-secondary" />}
            label="ヘルプ・お問い合わせ"
          />
          <MenuItem
            icon={<LogOut size={20} className="text-danger" />}
            label="ログアウト"
            danger
          />
        </div>
      </div>

      {/* App version */}
      <div className="mt-auto pb-24 pt-4 text-center">
        <p className="text-xs text-text-secondary">Sports Club Connect v1.0.0</p>
      </div>
    </div>
  )
}
