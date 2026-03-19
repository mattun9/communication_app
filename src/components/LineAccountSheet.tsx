import { useState } from 'react'
import { X, Check, LinkIcon, Unlink, AlertCircle } from 'lucide-react'
import { LineIcon } from './LineIcon'
import { useAuth } from '../hooks/useAuth'
import { isLineLoginEnabled, redirectToLineLogin } from '../lib/lineAuth'

interface LineAccountSheetProps {
  onClose: () => void
}

export function LineAccountSheet({ onClose }: LineAccountSheetProps) {
  const { user, updateUser } = useAuth()
  const [unlinking, setUnlinking] = useState(false)
  const [unlinked, setUnlinked] = useState(false)

  if (!user) return null

  const isLinked = !!user.lineUserId

  const handleLink = () => {
    redirectToLineLogin('link')
  }

  const handleUnlink = async () => {
    setUnlinking(true)
    try {
      // In demo mode, just update local state
      updateUser({
        lineUserId: undefined,
        lineDisplayName: undefined,
        lineNotificationEnabled: undefined,
        lineLinkedAt: undefined,
      })
      setUnlinked(true)
      setTimeout(() => onClose(), 1500)
    } catch {
      setUnlinking(false)
    }
  }

  if (!isLineLoginEnabled) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
        <div className="flex w-full max-w-lg animate-slide-up flex-col rounded-t-3xl bg-bg-card" style={{ maxHeight: '85dvh' }}>
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-base font-bold">LINE連携</h2>
            <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-bg">
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-col items-center gap-3 px-4 py-12">
            <AlertCircle size={40} className="text-text-secondary" />
            <p className="text-sm text-text-secondary text-center">
              LINE連携は現在ご利用いただけません。<br />管理者にお問い合わせください。
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="flex w-full max-w-lg animate-slide-up flex-col rounded-t-3xl bg-bg-card" style={{ maxHeight: '85dvh' }}>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-bold">LINE連携</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-bg">
            <X size={20} />
          </button>
        </div>

        {unlinked ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Check size={32} className="text-success" />
            </div>
            <p className="font-bold text-text">連携を解除しました</p>
          </div>
        ) : (
          <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-10 pt-6">
            {/* Status */}
            <div className="flex flex-col items-center gap-4">
              <div className={`flex h-20 w-20 items-center justify-center rounded-full ${isLinked ? 'bg-[#06C755]/10' : 'bg-bg'}`}>
                <LineIcon size={40} className={isLinked ? 'text-[#06C755]' : 'text-text-secondary'} />
              </div>

              {isLinked ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success">
                      <Check size={12} className="text-white" />
                    </div>
                    <span className="text-sm font-bold text-success">LINE連携済み</span>
                  </div>
                  {user.lineDisplayName && (
                    <p className="text-sm text-text-secondary">
                      連携アカウント: {user.lineDisplayName}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-center text-sm text-text-secondary leading-relaxed">
                  LINEアカウントを連携すると、メッセージや<br />
                  お知らせの通知をLINEで受け取れます。
                </p>
              )}
            </div>

            {/* Action */}
            {isLinked ? (
              <button
                onClick={handleUnlink}
                disabled={unlinking}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-danger/30 py-3.5 text-sm font-bold text-danger transition-all hover:bg-danger/5 disabled:opacity-50"
              >
                <Unlink size={16} />
                {unlinking ? '解除中...' : '連携を解除する'}
              </button>
            ) : (
              <button
                onClick={handleLink}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#06C755] py-3.5 text-base font-bold text-white shadow-md transition-all hover:bg-[#05b34c]"
              >
                <LinkIcon size={18} />
                LINEアカウントを連携する
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
