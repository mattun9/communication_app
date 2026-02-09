import { useState } from 'react'
import { Header } from '../components/Header'
import { X, AlertCircle, ExternalLink, Check } from 'lucide-react'

const ABSENCE_REASONS = [
  '体調不良',
  '家庭の事情',
  '学校行事',
  '他の習い事',
  '怪我',
  'その他',
] as const

const EXTERNAL_LINKS = [
  { label: '入会申し込み', url: '#' },
  { label: '退会届', url: '#' },
  { label: 'クラス変更申請', url: '#' },
  { label: '大会参加申込', url: '#' },
] as const

export function RequestPage() {
  const [showModal, setShowModal] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!selectedReason) return
    setSubmitted(true)
    setTimeout(() => {
      setShowModal(false)
      setSubmitted(false)
      setSelectedReason('')
    }, 1500)
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="申請" />

      <div className="space-y-4 p-4">
        {/* Absence button */}
        <button
          onClick={() => setShowModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-md transition-transform active:scale-[0.98]"
        >
          <AlertCircle size={20} />
          欠席連絡
        </button>

        {/* External links */}
        <div>
          <h2 className="mb-3 text-sm font-bold text-text-secondary">
            各種申請フォーム
          </h2>
          <div className="space-y-2">
            {EXTERNAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.url}
                className="flex items-center justify-between rounded-xl border border-border bg-bg-card p-4 transition-colors hover:bg-bg"
              >
                <span className="font-medium text-text">{link.label}</span>
                <ExternalLink size={16} className="text-text-secondary" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Absence modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-lg animate-slide-up rounded-t-3xl bg-bg-card pb-8">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <h2 className="text-lg font-bold">欠席連絡</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedReason('')
                  setSubmitted(false)
                }}
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
                <p className="font-bold text-text">送信しました</p>
              </div>
            ) : (
              <div className="px-4 pt-4">
                <p className="mb-4 text-sm text-text-secondary">
                  欠席の理由を選択してください
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ABSENCE_REASONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setSelectedReason(reason)}
                      className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
                        selectedReason === reason
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-text hover:border-primary/30'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedReason}
                  className="mt-6 w-full rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-md transition-all disabled:bg-border disabled:text-text-secondary disabled:shadow-none"
                >
                  送信する
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
