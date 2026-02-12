import { useState } from 'react'
import { X, Check, CalendarDays } from 'lucide-react'

const REASONS = ['体調不良', '家庭の事情', '学校行事', '他の習い事', '怪我', 'その他'] as const

interface AbsenceFormProps {
  onClose: () => void
  onSubmit: (data: { date: string; reason: string; note: string }) => void
}

export function AbsenceForm({ onClose, onSubmit }: AbsenceFormProps) {
  const [date, setDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!date || !reason) return
    setSubmitted(true)
    setTimeout(() => {
      onSubmit({ date, reason, note })
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-lg animate-slide-up rounded-t-3xl bg-bg-card pb-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-bold">お休み連絡</h2>
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
            <p className="font-bold text-text">送信しました</p>
            <p className="text-sm text-text-secondary">お休み連絡を受け付けました</p>
          </div>
        ) : (
          <div className="space-y-4 px-4 pt-4">
            {/* Date */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                お休みする日
              </label>
              <div className="relative">
                <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg py-3 pl-10 pr-3 text-sm text-text focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                理由
              </label>
              <div className="grid grid-cols-3 gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                      reason === r
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-text hover:border-primary/30'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                備考（任意）
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="詳細があれば入力してください"
                rows={2}
                className="w-full resize-none rounded-xl border border-border bg-bg p-3 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!date || !reason}
              className="w-full rounded-2xl bg-primary py-3.5 text-base font-bold text-white shadow-md transition-all disabled:bg-border disabled:text-text-secondary disabled:shadow-none"
            >
              送信する
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
