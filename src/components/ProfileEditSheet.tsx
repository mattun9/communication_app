import { useState, useRef } from 'react'
import { X, Check, Camera } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getMemberClassrooms } from '../lib/dummyData'

interface ProfileEditSheetProps {
  onClose: () => void
}

export function ProfileEditSheet({ onClose }: ProfileEditSheetProps) {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(user?.name ?? '')
  const [nameKana, setNameKana] = useState(user?.nameKana ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null)
  const [submitted, setSubmitted] = useState(false)

  if (!user) return null

  const classrooms = getMemberClassrooms(user.uid)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = () => {
    if (!name.trim()) return
    setSubmitted(true)
    setTimeout(() => {
      updateUser({
        name: name.trim(),
        nameKana: nameKana.trim(),
        phone: phone.trim() || undefined,
        email: email.trim(),
        avatarUrl: avatarPreview ?? undefined,
      })
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-lg animate-slide-up rounded-t-3xl bg-bg-card pb-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-bold">プロフィール編集</h2>
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
          <div className="space-y-4 overflow-y-auto px-4 pt-4" style={{ maxHeight: 'calc(85dvh - 56px)' }}>
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
                    {name.charAt(0) || user.name.charAt(0)}
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

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                名前
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg py-3 px-3 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>

            {/* NameKana */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                フリガナ
              </label>
              <input
                type="text"
                value={nameKana}
                onChange={(e) => setNameKana(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg py-3 px-3 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                電話番号
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="090-XXXX-XXXX"
                className="w-full rounded-xl border border-border bg-bg py-3 px-3 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg py-3 px-3 text-sm text-text focus:border-primary focus:outline-none"
              />
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

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="w-full rounded-2xl bg-primary py-3.5 text-base font-bold text-white shadow-md transition-all disabled:bg-border disabled:text-text-secondary disabled:shadow-none"
            >
              保存する
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
