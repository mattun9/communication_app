import { AlertTriangle, ChevronRight } from 'lucide-react'
import type { Broadcast } from '../types'

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
  const sentAt = broadcast.sentAt ?? broadcast.createdAt

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
            <img
              src={broadcast.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="p-3.5">
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
