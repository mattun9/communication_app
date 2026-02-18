import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Check,
  Mail,
  Lock,
  Trash2,
  LogOut,
  ArrowLeft,
  AlertTriangle,
  ChevronRight,
  UserPlus,
  User,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getSiblings, getClassLabel } from '../lib/dummyData'
import type { Guardian } from '../types'

interface AccountManagementSheetProps {
  onClose: () => void
}

function MenuItem({ icon, label, onClick, danger }: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3.5 transition-colors hover:bg-bg ${
        danger ? 'text-danger' : 'text-text'
      }`}
    >
      {icon}
      <span className="flex-1 text-left text-sm font-medium">{label}</span>
      {!danger && <ChevronRight size={16} className="text-text-secondary" />}
    </button>
  )
}

const RELATION_OPTIONS = ['父', '母', '祖父', '祖母', 'その他']

export function AccountManagementSheet({ onClose }: AccountManagementSheetProps) {
  const { user, updateUser, switchChild, logout } = useAuth()
  const navigate = useNavigate()

  const [subView, setSubView] = useState<'main' | 'email' | 'password' | 'deleteConfirm' | 'guardian'>('main')
  const [submitted, setSubmitted] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Email change
  const [newEmail, setNewEmail] = useState('')

  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Guardian add
  const [guardianName, setGuardianName] = useState('')
  const [guardianEmail, setGuardianEmail] = useState('')
  const [guardianRelation, setGuardianRelation] = useState('')

  if (!user) return null

  const siblings = getSiblings(user.uid)
  const guardians = user.guardians ?? []

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setSubmitted(true)
    setTimeout(() => {
      onClose()
    }, 1200)
  }

  const handleEmailChange = () => {
    if (!newEmail.trim()) return
    updateUser({ email: newEmail.trim() })
    showSuccess('メールアドレスを変更しました')
  }

  const handlePasswordChange = () => {
    setPasswordError('')
    if (!currentPassword) {
      setPasswordError('現在のパスワードを入力してください')
      return
    }
    if (!newPassword) {
      setPasswordError('新しいパスワードを入力してください')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('新しいパスワードが一致しません')
      return
    }
    showSuccess('パスワードを変更しました')
  }

  const handleDelete = () => {
    logout()
    onClose()
    navigate('/login')
  }

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/login')
  }

  const handleChildSwitch = (uid: string) => {
    if (uid === user.uid) return
    switchChild(uid)
    onClose()
  }

  const handleGuardianAdd = () => {
    if (!guardianName.trim() || !guardianEmail.trim() || !guardianRelation) return
    const newGuardian: Guardian = {
      id: `g-${Date.now()}`,
      name: guardianName.trim(),
      email: guardianEmail.trim(),
      relation: guardianRelation,
    }
    updateUser({ guardians: [...guardians, newGuardian] })
    showSuccess('保護者を追加しました')
  }

  const title =
    subView === 'email' ? 'メールアドレス変更' :
    subView === 'password' ? 'パスワード変更' :
    subView === 'deleteConfirm' ? '退会' :
    subView === 'guardian' ? '保護者を追加' :
    'アカウント管理'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-lg animate-slide-up rounded-t-3xl bg-bg-card pb-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            {subView !== 'main' && !submitted && (
              <button
                onClick={() => { setSubView('main'); setPasswordError('') }}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-bg"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-base font-bold">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-bg"
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Check size={32} className="text-success" />
            </div>
            <p className="font-bold text-text">完了</p>
            <p className="text-sm text-text-secondary">{successMessage}</p>
          </div>
        ) : subView === 'main' ? (
          <div className="overflow-y-auto px-4 pt-4 space-y-4" style={{ maxHeight: 'calc(85dvh - 56px)' }}>
            {/* Child switcher */}
            {siblings.length > 0 && (
              <div>
                <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                  お子様切替
                </label>
                <div className="space-y-2">
                  {[user, ...siblings].map((child) => (
                    <button
                      key={child.uid}
                      onClick={() => handleChildSwitch(child.uid)}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 transition-colors ${
                        child.uid === user.uid
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                        {child.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-text">{child.name}</p>
                        <p className="text-xs text-text-secondary">{getClassLabel(child.classId)}</p>
                      </div>
                      {child.uid === user.uid && (
                        <span className="ml-auto text-xs font-bold text-primary">現在</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Guardian info */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                保護者情報
              </label>
              <div className="space-y-2">
                {guardians.map((g, i) => (
                  <div
                    key={g.id}
                    className="flex items-center gap-3 rounded-xl border-2 border-border p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg text-text-secondary">
                      <User size={18} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-text">
                        {g.name}
                        <span className="ml-1.5 text-xs text-text-secondary">（{g.relation}）</span>
                      </p>
                      <p className="text-xs text-text-secondary">{g.email}</p>
                    </div>
                    {i === 0 && (
                      <span className="text-xs font-bold text-primary">現在</span>
                    )}
                  </div>
                ))}
                {guardians.length < 2 && (
                  <button
                    onClick={() => setSubView('guardian')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-3 text-sm font-medium text-text-secondary transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    <UserPlus size={16} />
                    保護者を追加
                  </button>
                )}
              </div>
            </div>

            {/* Menu items */}
            <div className="border-t border-border pt-2">
              <MenuItem icon={<Mail size={20} className="text-text-secondary" />} label="メールアドレス変更" onClick={() => setSubView('email')} />
              <MenuItem icon={<Lock size={20} className="text-text-secondary" />} label="パスワード変更" onClick={() => setSubView('password')} />
            </div>
            <div className="border-t border-border pt-2">
              <MenuItem icon={<Trash2 size={20} className="text-danger" />} label="退会する" onClick={() => setSubView('deleteConfirm')} danger />
              <MenuItem icon={<LogOut size={20} className="text-danger" />} label="ログアウト" onClick={handleLogout} danger />
            </div>
          </div>
        ) : subView === 'guardian' ? (
          <div className="space-y-4 px-4 pt-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                名前
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="保護者の名前"
                className="w-full rounded-xl border border-border bg-bg py-3 px-3 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                メールアドレス
              </label>
              <input
                type="email"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full rounded-xl border border-border bg-bg py-3 px-3 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                続柄
              </label>
              <div className="flex flex-wrap gap-2">
                {RELATION_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setGuardianRelation(r)}
                    className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors ${
                      guardianRelation === r
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-text-secondary hover:border-primary/30'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleGuardianAdd}
              disabled={!guardianName.trim() || !guardianEmail.trim() || !guardianRelation}
              className="w-full rounded-2xl bg-primary py-3.5 text-base font-bold text-white shadow-md transition-all disabled:bg-border disabled:text-text-secondary disabled:shadow-none"
            >
              追加する
            </button>
          </div>
        ) : subView === 'email' ? (
          <div className="space-y-4 px-4 pt-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                現在のメールアドレス
              </label>
              <p className="rounded-xl border border-border bg-bg px-3 py-3 text-sm text-text-secondary">
                {user.email}
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                新しいメールアドレス
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full rounded-xl border border-border bg-bg py-3 px-3 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
              />
            </div>
            <button
              onClick={handleEmailChange}
              disabled={!newEmail.trim()}
              className="w-full rounded-2xl bg-primary py-3.5 text-base font-bold text-white shadow-md transition-all disabled:bg-border disabled:text-text-secondary disabled:shadow-none"
            >
              変更する
            </button>
          </div>
        ) : subView === 'password' ? (
          <div className="space-y-4 px-4 pt-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                現在のパスワード
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg py-3 px-3 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                新しいパスワード
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg py-3 px-3 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                新しいパスワード（確認）
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg py-3 px-3 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>
            {passwordError && (
              <p className="text-xs font-medium text-danger">{passwordError}</p>
            )}
            <button
              onClick={handlePasswordChange}
              disabled={!currentPassword || !newPassword || !confirmPassword}
              className="w-full rounded-2xl bg-primary py-3.5 text-base font-bold text-white shadow-md transition-all disabled:bg-border disabled:text-text-secondary disabled:shadow-none"
            >
              変更する
            </button>
          </div>
        ) : subView === 'deleteConfirm' ? (
          <div className="flex flex-col items-center gap-4 px-4 pt-8 pb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
              <AlertTriangle size={32} className="text-danger" />
            </div>
            <h3 className="text-lg font-bold text-text">本当に退会しますか？</h3>
            <p className="text-center text-sm text-text-secondary">
              退会すると、すべてのデータが削除され、
              <br />
              元に戻すことはできません。
            </p>
            <div className="mt-2 flex w-full gap-3">
              <button
                onClick={() => setSubView('main')}
                className="flex-1 rounded-2xl border-2 border-border py-3.5 text-base font-bold text-text transition-colors hover:bg-bg"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-2xl bg-danger py-3.5 text-base font-bold text-white shadow-md transition-all"
              >
                退会する
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
