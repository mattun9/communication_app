import { useState, useRef } from 'react'
import { X, Check, Camera } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useMemberClassrooms } from '../hooks/useData'

interface ProfileEditSheetProps {
  onClose: () => void
}

export function ProfileEditSheet({ onClose }: ProfileEditSheetProps) {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null)
  const [submitted, setSubmitted] = useState(false)

  const getMemberClassrooms = useMemberClassrooms()

  if (!user) return null

  const classrooms = getMemberClassrooms(user.uid)
  const avatarChanged = avatarPreview !== (user.avatarUrl ?? null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = () => {
    if (!avatarChanged) return
    setSubmitted(true)
    setTimeout(() => {
      updateUser({
        avatarUrl: avatarPreview ?? undefined,
      })
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="flex w-full max-w-lg animate-slide-up flex-col rounded-t-3xl bg-bg-card" style={{ maxHeight: '85dvh' }}>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-bold">プロフィール</h2>
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
            <p className="font-bold text-text">保存しました</p>
            <p className="text-sm text-text-secondary">プロフィールを更新しました</p>
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-10 pt-4">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group relative"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="アバター"
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera size={24} className="text-white" />
                </div>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-primary"
              >
                写真を変更
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Member Number */}
            {user.memberNumber && (
              <div>
                <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                  会員番号
                </label>
                <p className="rounded-xl border border-border bg-bg px-3 py-3 text-sm text-text-secondary">
                  {user.memberNumber}
                </p>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                名前
              </label>
              <p className="rounded-xl border border-border bg-bg px-3 py-3 text-sm text-text-secondary">
                {user.name}
              </p>
            </div>

            {/* NameKana */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                フリガナ
              </label>
              <p className="rounded-xl border border-border bg-bg px-3 py-3 text-sm text-text-secondary">
                {user.nameKana}
              </p>
            </div>

            {/* Phone */}
            {user.phone && (
              <div>
                <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                  電話番号
                </label>
                <p className="rounded-xl border border-border bg-bg px-3 py-3 text-sm text-text-secondary">
                  {user.phone}
                </p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                メールアドレス
              </label>
              <p className="rounded-xl border border-border bg-bg px-3 py-3 text-sm text-text-secondary">
                {user.email}
              </p>
            </div>

            {/* Class (read-only) */}
            {classrooms.length > 0 && (
              <div>
                <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                  所属クラス
                </label>
                <div className="flex flex-wrap gap-2">
                  {classrooms.map((c) => (
                    <span
                      key={c.id}
                      className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Save - only shown when avatar changed */}
            {avatarChanged && (
              <button
                onClick={handleSave}
                className="w-full rounded-2xl bg-primary py-3.5 text-base font-bold text-white shadow-md transition-all"
              >
                保存する
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
