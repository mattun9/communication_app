import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { LineIcon } from './LineIcon'
import { useAuth } from '../hooks/useAuth'
import { isLineLoginEnabled } from '../lib/lineAuth'

interface NotificationSettingsSheetProps {
  onClose: () => void
}

function ToggleRow({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-3">
      <span className="text-sm font-medium text-text">{label}</span>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary' : 'bg-border'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export function NotificationSettingsSheet({ onClose }: NotificationSettingsSheetProps) {
  const { user, updateUser } = useAuth()
  const [chatEnabled, setChatEnabled] = useState(true)
  const [announcementEnabled, setAnnouncementEnabled] = useState(true)
  const [scheduleEnabled, setScheduleEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lineEnabled, setLineEnabled] = useState(user?.lineNotificationEnabled ?? true)
  const [quietStart, setQuietStart] = useState('22:00')
  const [quietEnd, setQuietEnd] = useState('07:00')
  const [submitted, setSubmitted] = useState(false)

  const handleSave = () => {
    setSubmitted(true)
    setTimeout(() => {
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="flex w-full max-w-lg animate-slide-up flex-col rounded-t-3xl bg-bg-card" style={{ maxHeight: '85dvh' }}>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-bold">通知設定</h2>
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
            <p className="text-sm text-text-secondary">通知設定を更新しました</p>
          </div>
        ) : (
          <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-10 pt-4">
            {/* Category toggles */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                通知カテゴリ
              </label>
              <ToggleRow label="チャット通知" enabled={chatEnabled} onToggle={() => setChatEnabled(v => !v)} />
              <ToggleRow label="お知らせ通知" enabled={announcementEnabled} onToggle={() => setAnnouncementEnabled(v => !v)} />
              <ToggleRow label="スケジュール通知" enabled={scheduleEnabled} onToggle={() => setScheduleEnabled(v => !v)} />
            </div>

            {/* LINE通知 */}
            {isLineLoginEnabled && (
              <div>
                <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                  LINE通知
                </label>
                {user?.lineUserId ? (
                  <div className="flex items-center justify-between border-b border-border/50 py-3">
                    <div className="flex items-center gap-2">
                      <LineIcon size={16} className="text-[#06C755]" />
                      <span className="text-sm font-medium text-text">LINE通知</span>
                    </div>
                    <button
                      onClick={() => {
                        const next = !lineEnabled
                        setLineEnabled(next)
                        updateUser({ lineNotificationEnabled: next })
                      }}
                      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                        lineEnabled ? 'bg-[#06C755]' : 'bg-border'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          lineEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ) : (
                  <p className="py-3 text-xs text-text-secondary">
                    マイページからLINE連携を行うと、LINE通知を受け取れます
                  </p>
                )}
              </div>
            )}

            {/* Sound */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                サウンド
              </label>
              <ToggleRow label="通知音" enabled={soundEnabled} onToggle={() => setSoundEnabled(v => !v)} />
            </div>

            {/* Quiet hours */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                おやすみ時間帯
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-bg py-3 px-3 text-sm text-text focus:border-primary focus:outline-none"
                />
                <span className="text-sm text-text-secondary">〜</span>
                <input
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-bg py-3 px-3 text-sm text-text focus:border-primary focus:outline-none"
                />
              </div>
              <p className="mt-1.5 text-xs text-text-secondary">
                この時間帯は通知を受け取りません
              </p>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              className="w-full rounded-2xl bg-primary py-3.5 text-base font-bold text-white shadow-md transition-all"
            >
              保存する
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
