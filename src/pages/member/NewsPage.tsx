import { useState, useMemo, Fragment } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { BroadcastDetailModal } from '../../components/BroadcastDetailModal'
import { Hash, AlertTriangle } from 'lucide-react'
import {
  DUMMY_BROADCASTS,
  DUMMY_READ_STATUSES,
  DUMMY_CLASSROOMS,
} from '../../lib/dummyData'
import type { Broadcast } from '../../types'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function formatDateTime(date: Date): string {
  const m = date.getMonth() + 1
  const d = date.getDate()
  const w = WEEKDAYS[date.getDay()]
  const h = date.getHours()
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${m}/${d}(${w}) ${h}:${min}`
}

function formatDateSeparator(date: Date): string {
  return `${date.getMonth() + 1}.${date.getDate()}(${WEEKDAYS[date.getDay()]})`
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function MemberNewsPage() {
  const { user } = useAuth()
  const [readBroadcasts, setReadBroadcasts] = useState<Set<string>>(() => {
    const userReads = DUMMY_READ_STATUSES.filter((r) => r.userId === user?.uid)
    return new Set(userReads.map((r) => r.broadcastId))
  })
  const [openBroadcast, setOpenBroadcast] = useState<Broadcast | null>(null)

  // ユーザーに関係する配信のみ
  const broadcasts = useMemo(
    () =>
      DUMMY_BROADCASTS.filter(
        (bc) =>
          (bc.status === 'sent' || bc.status === 'recalled') &&
          (bc.targetType === 'all' ||
            (bc.targetType === 'class' && user && bc.targetClassIds.some((id) => user.classIds.includes(id))))
      ).sort((a, b) => (b.sentAt ?? b.createdAt).getTime() - (a.sentAt ?? a.createdAt).getTime()),
    [user]
  )

  const handleOpen = (bc: Broadcast) => {
    setOpenBroadcast(bc)
    setReadBroadcasts((prev) => new Set(prev).add(bc.id))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-12 items-center border-b border-border bg-bg-card px-4">
        <h1 className="text-base font-bold text-text">お知らせ</h1>
      </header>

      {/* Slack/Discord-style message feed */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {broadcasts.length === 0 ? (
          <p className="py-16 text-center text-sm text-text-secondary">お知らせはありません</p>
        ) : (
          <div>
            {broadcasts.map((bc, index) => {
              const isRead = readBroadcasts.has(bc.id)
              const sentAt = bc.sentAt ?? bc.createdAt
              const isRecalled = bc.status === 'recalled'
              const prevDate = index > 0 ? (broadcasts[index - 1].sentAt ?? broadcasts[index - 1].createdAt) : null
              const showDate = !prevDate || !isSameDay(prevDate, sentAt)

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
              }

              return (
                <Fragment key={bc.id}>
                  {showDate && (
                    <div className="flex justify-center py-3">
                      <span className="rounded-full bg-bg px-3 py-1 text-[11px] font-medium text-text-secondary">
                        {formatDateSeparator(sentAt)}
                      </span>
                    </div>
                  )}
                  {isRecalled ? (
                    <div className="border-b border-border/40 px-4 py-3 opacity-50">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-bg text-[11px] font-bold text-text-secondary">
                          管
                        </div>
                        <span className="text-[13px] font-bold text-text-secondary">管理者</span>
                        <span className="ml-auto text-[11px] text-text-secondary">{formatDateTime(sentAt)}</span>
                      </div>
                      <p className="mt-1 pl-9 text-sm italic text-text-secondary">この配信は取り消されました</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpen(bc)}
                      className={`w-full border-b border-border/40 px-4 py-3 text-left transition-colors ${!isRead ? 'bg-primary/[0.04]' : 'hover:bg-bg/50'}`}
                    >
                      {/* Header: avatar + name + segments + date+time */}
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                          管
                        </div>
                        <span className="text-[13px] font-bold text-text">管理者</span>
                        <div className="flex items-center gap-1">
                          {segmentLabels.slice(0, 2).map((label, i) => (
                            <span
                              key={label}
                              className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                i === 0 && bc.targetType === 'class'
                                  ? 'bg-primary/15 text-primary'
                                  : 'bg-bg text-text-secondary'
                              }`}
                            >
                              <Hash size={9} />{label}
                            </span>
                          ))}
                          {segmentLabels.length > 2 && (
                            <span className="text-[10px] text-text-secondary">他{segmentLabels.length - 2}件</span>
                          )}
                        </div>
                        {bc.isImportant && (
                          <AlertTriangle size={12} className="shrink-0 text-accent" />
                        )}
                        <span className="ml-auto shrink-0 text-[11px] text-text-secondary">
                          {formatDateTime(sentAt)}
                        </span>
                      </div>

                      {/* Title + body */}
                      <div className="pl-9">
                        <p className={`text-[13px] leading-snug ${isRead ? 'font-medium text-text' : 'font-bold text-text'}`}>
                          {bc.title}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-text-secondary">
                          {bc.body}
                        </p>
                      </div>

                      {/* Unread indicator */}
                      {!isRead && (
                        <div className="mt-1.5 pl-9">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                        </div>
                      )}
                    </button>
                  )}
                </Fragment>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {openBroadcast && (
        <BroadcastDetailModal
          broadcast={openBroadcast}
          onClose={() => setOpenBroadcast(null)}
        />
      )}
    </div>
  )
}
