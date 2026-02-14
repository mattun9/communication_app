import { AlertTriangle, ChevronRight, Hash } from 'lucide-react'
import type { Broadcast } from '../types'
import { getTargetLabelForMember } from '../lib/dummyData'
import { useAuth } from '../hooks/useAuth'

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  if (days === 1) return '昨日'
  if (days < 7) return `${days}日前`
  return `${date.getMonth() + 1}/${date.getDate()}`
}

interface BroadcastCardProps {
  broadcast: Broadcast
  isRead: boolean
  onOpen: (broadcast: Broadcast) => void
}

export function BroadcastCard({ broadcast, isRead, onOpen }: BroadcastCardProps) {
  const { user } = useAuth()
  const sentAt = broadcast.sentAt ?? broadcast.createdAt
  const segmentLabels = getTargetLabelForMember(broadcast, user?.classIds ?? [])

  if (broadcast.status === 'recalled') {
    return (
      <div className="px-4 py-2">
        <div className="w-full overflow-hidden rounded-2xl border border-border bg-bg-card opacity-60">
          <div className="p-3.5">
            <p className="text-sm italic text-text-secondary">この配信は取り消されました</p>
            <div className="mt-1">
              <span className="text-[11px] text-text-secondary">{formatTime(sentAt)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-2">
      <button
        onClick={() => onOpen(broadcast)}
        className={`w-full overflow-hidden rounded-2xl border text-left transition-shadow hover:shadow-md ${
          broadcast.isImportant && !isRead
            ? 'border-accent/40 bg-accent/5'
            : isRead
              ? 'border-border bg-bg-card'
              : 'border-primary/30 bg-bg-card shadow-sm'
        }`}
      >
        {broadcast.imageUrl && (
          <div className="h-36 w-full overflow-hidden bg-bg">
            <img src={broadcast.imageUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="p-3.5">
          {/* セグメントラベル (自分のクラス優先) */}
          <div className="mb-1.5 flex flex-wrap items-center gap-1">
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
          {broadcast.isImportant && (
            <div className="mb-1.5 flex items-center gap-1 text-accent">
              <AlertTriangle size={13} />
              <span className="text-[11px] font-bold">重要</span>
            </div>
          )}
          <h3 className={`text-sm leading-snug ${isRead ? 'font-medium text-text' : 'font-bold text-text'}`}>
            {broadcast.title}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-text-secondary">
              {formatTime(sentAt)}
            </span>
            <span className="flex items-center gap-0.5 text-xs font-medium text-primary">
              詳細を見る
              <ChevronRight size={14} />
            </span>
          </div>
        </div>
        {!isRead && (
          <div className="h-0.5 bg-primary" />
        )}
      </button>
    </div>
  )
}
