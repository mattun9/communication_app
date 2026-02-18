import { useState, useMemo, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Hash, AlertTriangle } from 'lucide-react'
import {
  DUMMY_BROADCASTS,
  DUMMY_READ_STATUSES,
  DUMMY_CLASSROOMS,
} from '../../lib/dummyData'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function formatDateTime(date: Date): string {
  const m = date.getMonth() + 1
  const d = date.getDate()
  const w = WEEKDAYS[date.getDay()]
  const h = date.getHours()
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${m}/${d}(${w}) ${h}:${min}`
}

export function MemberNewsPage() {
  const { user } = useAuth()
  const location = useLocation()
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [readBroadcasts, setReadBroadcasts] = useState<Set<string>>(() => {
    const userReads = DUMMY_READ_STATUSES.filter((r) => r.userId === user?.uid)
    return new Set(userReads.map((r) => r.broadcastId))
  })
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const broadcasts = useMemo(
    () =>
      DUMMY_BROADCASTS.filter(
        (bc) =>
          (bc.status === 'sent' || bc.status === 'recalled') &&
          (bc.targetType === 'all' ||
            (bc.targetType === 'class' && user && bc.targetClassIds.some((id) => user.classIds.includes(id))) ||
            (bc.targetType === 'individual' && user && bc.targetUserIds?.includes(user.uid)))
      ).sort((a, b) => (b.sentAt ?? b.createdAt).getTime() - (a.sentAt ?? a.createdAt).getTime()),
    [user]
  )

  // Hash-based scroll to specific broadcast
  useEffect(() => {
    const hash = location.hash
    if (!hash.startsWith('#bc-')) return
    const targetId = hash.slice(4)
    // Expand and mark as read
    setExpandedIds((prev) => new Set(prev).add(targetId))
    setReadBroadcasts((prev) => new Set(prev).add(targetId))
    setHighlightId(targetId)
    // Scroll after render
    requestAnimationFrame(() => {
      const el = scrollRefs.current[targetId]
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
    // Remove highlight after animation
    const timer = setTimeout(() => setHighlightId(null), 2000)
    return () => clearTimeout(timer)
  }, [location.hash])

  const handleExpand = (bcId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(bcId)) {
        next.delete(bcId)
      } else {
        next.add(bcId)
      }
      return next
    })
    // 展開時に既読マーク
    setReadBroadcasts((prev) => new Set(prev).add(bcId))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-12 items-center border-b border-border bg-bg-card px-4">
        <h1 className="text-base font-bold text-text">お知らせ</h1>
      </header>

      {/* SNS Feed */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-bg">
        {broadcasts.length === 0 ? (
          <p className="py-16 text-center text-sm text-text-secondary">お知らせはありません</p>
        ) : (
          <div>
            {broadcasts.map((bc) => {
              const isRead = readBroadcasts.has(bc.id)
              const isExpanded = expandedIds.has(bc.id)
              const sentAt = bc.sentAt ?? bc.createdAt

              // セグメントラベル
              const segmentLabels: string[] = []
              if (bc.targetType === 'all') {
                segmentLabels.push('全体')
              } else if (bc.targetType === 'class') {
                const myIds = user?.classIds ?? []
                const myClasses = bc.targetClassIds.filter((id) => myIds.includes(id))
                const otherClasses = bc.targetClassIds.filter((id) => !myIds.includes(id))
                ;[...myClasses, ...otherClasses].forEach((id) => {
                  const name = DUMMY_CLASSROOMS.find((c) => c.id === id)?.name ?? id
                  segmentLabels.push(name)
                })
              } else if (bc.targetType === 'individual') {
                segmentLabels.push('個別')
              }

              // 取消済み
              if (bc.status === 'recalled') {
                return (
                  <div key={bc.id} className="border-b border-border bg-bg-card px-4 py-4 opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg text-xs font-bold text-text-secondary">
                        管
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-bold text-text-secondary">管理者</span>
                        <span className="ml-2 text-[11px] text-text-secondary">{formatDateTime(sentAt)}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm italic text-text-secondary">この配信は取り消されました</p>
                  </div>
                )
              }

              return (
                <div
                  key={bc.id}
                  ref={(el) => { scrollRefs.current[bc.id] = el }}
                  className={`border-b border-border bg-bg-card transition-colors duration-1000 ${!isRead ? 'border-l-[3px] border-l-primary' : ''} ${highlightId === bc.id ? 'bg-primary/10' : ''}`}
                >
                  <div className="px-4 py-4">
                    {/* Header: avatar + name + datetime */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        管
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-bold text-text">管理者</span>
                      </div>
                      <span className="shrink-0 text-[11px] text-text-secondary">
                        {formatDateTime(sentAt)}
                      </span>
                    </div>

                    {/* Segment labels + important badge */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {segmentLabels.map((label, i) => (
                        <span
                          key={label}
                          className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            i === 0 && bc.targetType === 'class'
                              ? 'bg-primary/15 text-primary'
                              : 'bg-bg text-text-secondary'
                          }`}
                        >
                          <Hash size={10} />{label}
                        </span>
                      ))}
                      {bc.isImportant && (
                        <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent">
                          <AlertTriangle size={11} /> 重要
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className={`mt-2.5 text-sm leading-snug ${isRead ? 'font-medium text-text' : 'font-bold text-text'}`}>
                      {bc.title}
                    </h3>

                    {/* Body */}
                    <div className="mt-1.5">
                      <p className={`whitespace-pre-wrap text-[13px] leading-relaxed text-text-secondary ${isExpanded ? '' : 'line-clamp-6'}`}>
                        {bc.body}
                      </p>
                      <button
                        onClick={() => handleExpand(bc.id)}
                        className="mt-1 text-[13px] font-medium text-primary"
                      >
                        {isExpanded ? '閉じる' : 'もっと見る'}
                      </button>
                    </div>

                    {/* Image */}
                    {bc.imageUrl && (
                      <div className="mt-3 overflow-hidden rounded-xl">
                        <img src={bc.imageUrl} alt="" className="max-h-48 w-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
