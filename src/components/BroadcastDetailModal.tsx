import { X, AlertTriangle, Hash } from 'lucide-react'
import type { Broadcast } from '../types'
import { getTargetLabelForMember } from '../lib/dummyData'
import { useAuth } from '../hooks/useAuth'

interface BroadcastDetailModalProps {
  broadcast: Broadcast
  onClose: () => void
}

export function BroadcastDetailModal({ broadcast, onClose }: BroadcastDetailModalProps) {
  const { user } = useAuth()
  const sentAt = broadcast.sentAt ?? broadcast.createdAt
  const segmentLabels = getTargetLabelForMember(broadcast, user?.classIds ?? [])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg animate-slide-up rounded-t-3xl bg-bg-card"
        style={{ maxHeight: '85dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {broadcast.isImportant && (
              <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent">
                <AlertTriangle size={12} />
                重要
              </span>
            )}
            {segmentLabels.map((label, i) => (
              <span
                key={label}
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  i === 0 && broadcast.targetType === 'class'
                    ? 'bg-primary/15 text-primary'
                    : 'bg-bg text-text-secondary'
                }`}
              >
                <Hash size={9} />{label}
              </span>
            ))}
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-bg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(85dvh - 56px)' }}>
          {broadcast.imageUrl && (
            <div className="mb-4 overflow-hidden rounded-xl">
              <img src={broadcast.imageUrl} alt="" className="max-h-56 w-full object-cover" />
            </div>
          )}

          <h2 className="mb-3 text-lg font-bold text-text">{broadcast.title}</h2>

          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">
            {broadcast.body}
          </p>

          <div className="mt-6 border-t border-border pt-3 text-xs text-text-secondary">
            配信日時: {sentAt.getFullYear()}/{sentAt.getMonth() + 1}/{sentAt.getDate()}{' '}
            {sentAt.getHours()}:{String(sentAt.getMinutes()).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  )
}
