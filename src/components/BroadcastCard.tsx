import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ChevronRight, Hash, Megaphone } from 'lucide-react'
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
  const navigate = useNavigate()
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

  const handleDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Mark as read via onOpen
    onOpen(broadcast)
    // Navigate to news page with hash for scroll target
    navigate(`/member/news#bc-${broadcast.id}`)
  }

  return (
    <div className="px-4 py-1.5">
      <div
        className={`overflow-hidden rounded-xl border text-left transition-shadow ${
          broadcast.isImportant && !isRead
            ? 'border-accent/40 bg-accent/5'
            : isRead
              ? 'border-border bg-bg-card'
              : 'border-primary/30 bg-bg-card'
        }`}
      >
        <div className="flex items-start gap-2.5 p-3">
          {/* Icon */}
          <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            broadcast.isImportant && !isRead ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
          }`}>
            <Megaphone size={14} />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Segment labels */}
            <div className="mb-1 flex flex-wrap items-center gap-1">
              {segmentLabels.map((label, i) => (
                <span
                  key={label}
                  className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    i === 0 && broadcast.targetType === 'class'
                      ? 'bg-primary/15 text-primary'
                      : 'bg-bg text-text-secondary'
                  }`}
                >
                  <Hash size={8} />{label}
                </span>
              ))}
              {broadcast.isImportant && (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-accent">
                  <AlertTriangle size={9} /> 重要
                </span>
              )}
              <span className="ml-auto text-[10px] text-text-secondary">
                {formatTime(sentAt)}
              </span>
            </div>

            {/* Title */}
            <h3 className={`text-[13px] leading-snug ${isRead ? 'font-medium text-text' : 'font-bold text-text'}`}>
              {broadcast.title}
            </h3>

            {/* Truncated body */}
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-text-secondary">
              {broadcast.body}
            </p>

            {/* Detail link */}
            <button
              onClick={handleDetailClick}
              className="mt-1.5 flex items-center gap-0.5 text-[11px] font-medium text-primary"
            >
              詳細を表示
              <ChevronRight size={12} />
            </button>
          </div>

          {/* Thumbnail image */}
          {broadcast.imageUrl && (
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-bg">
              <img src={broadcast.imageUrl} alt="" className="h-full w-full object-cover" />
            </div>
          )}
        </div>
        {!isRead && (
          <div className="h-0.5 bg-primary" />
        )}
      </div>
    </div>
  )
}
