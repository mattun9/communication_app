import { useState, useRef, useEffect, useMemo, useCallback, Fragment } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { BroadcastCard } from '../../components/BroadcastCard'
import { BroadcastDetailModal } from '../../components/BroadcastDetailModal'
import { AbsenceForm } from '../../components/AbsenceForm'
import { AbsenceCard } from '../../components/AbsenceCard'
import { AttachmentPreview } from '../../components/AttachmentPreview'
import { ImagePreviewModal } from '../../components/ImagePreviewModal'
import { FileAttachmentButton } from '../../components/FileAttachmentButton'
import { MessageContextMenu } from '../../components/MessageContextMenu'
import { SendHorizontal, CalendarOff, Bell, Ban, X } from 'lucide-react'
import {
  DUMMY_BROADCASTS,
  DUMMY_MESSAGES,
  DUMMY_READ_STATUSES,
} from '../../lib/dummyData'
import type { Message, Broadcast } from '../../types'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function formatLINETime(date: Date): string {
  const h = date.getHours()
  const m = String(date.getMinutes()).padStart(2, '0')
  const period = h < 12 ? '午前' : '午後'
  return `${period} ${h % 12}:${m}`
}

function formatDateSeparator(date: Date): string {
  return `${date.getMonth() + 1}.${date.getDate()}(${WEEKDAYS[date.getDay()]})`
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

// タイムライン上の統合アイテム
type TimelineItem =
  | { kind: 'broadcast'; data: Broadcast; time: Date }
  | { kind: 'message'; data: Message; time: Date }

function ChatBubble({
  message,
  isMine,
  onLongPress,
  onImageClick,
}: {
  message: Message
  isMine: boolean
  onLongPress: (messageId: string, x: number, y: number) => void
  onImageClick: (url: string) => void
}) {
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onLongPress(message.id, e.clientX, e.clientY)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchPos.current = { x: touch.clientX, y: touch.clientY }
    touchTimer.current = setTimeout(() => {
      onLongPress(message.id, touchPos.current.x, touchPos.current.y)
    }, 500)
  }

  const handleTouchEnd = () => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current)
      touchTimer.current = null
    }
  }

  const handleTouchMove = () => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current)
      touchTimer.current = null
    }
  }

  // Absence card rendering
  if (message.type === 'absence') {
    return <AbsenceCard message={message} />
  }

  // System message rendering
  if (message.type === 'system') {
    return (
      <div className="flex justify-center px-4 py-1.5">
        <div className="rounded-full bg-bg px-4 py-1.5 text-xs text-text-secondary">
          {message.text}
        </div>
      </div>
    )
  }

  // Deleted message rendering
  if (message.isDeleted) {
    return (
      <div className={`flex px-4 py-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
        <div className="flex items-end gap-1.5">
          {isMine && (
            <span className="shrink-0 pb-0.5 text-[10px] text-text-secondary">
              {formatLINETime(message.createdAt)}
            </span>
          )}
          <div className="flex items-center gap-1.5 rounded-2xl bg-bg px-4 py-2.5">
            <Ban size={14} className="text-text-secondary" />
            <p className="text-sm italic text-text-secondary">
              このメッセージは取り消されました
            </p>
          </div>
          {!isMine && (
            <span className="shrink-0 pb-0.5 text-[10px] text-text-secondary">
              {formatLINETime(message.createdAt)}
            </span>
          )}
        </div>
      </div>
    )
  }

  // My message bubble (LINE-style: 既読+時刻 on left)
  if (isMine) {
    return (
      <div
        className="flex justify-end px-4 py-0.5"
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        <div className="flex max-w-[75%] items-end gap-1.5">
          <div className="flex shrink-0 flex-col items-end pb-0.5">
            {message.isReadByRecipient && (
              <span className="text-[10px] leading-tight text-primary/70">既読</span>
            )}
            <span className="text-[10px] leading-tight text-text-secondary">
              {formatLINETime(message.createdAt)}
            </span>
          </div>
          <div className="min-w-0 rounded-2xl rounded-tr-sm bg-bubble-mine px-4 py-2.5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-white">
              {message.text}
            </p>
            {message.attachmentUrl && message.attachmentType && (
              <AttachmentPreview
                url={message.attachmentUrl}
                type={message.attachmentType}
                fileName={message.attachmentName}
                onImageClick={() => onImageClick(message.attachmentUrl!)}
                variant="dark"
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  // Other's message bubble (LINE-style: 時刻 on right)
  return (
    <div
      className="flex justify-start px-4 py-0.5"
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <div className="flex max-w-[80%] items-start gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
          {message.senderName.charAt(0)}
        </div>
        <div className="min-w-0">
          <span className="mb-0.5 block text-[11px] font-semibold text-text-secondary">
            {message.senderName}
          </span>
          <div className="flex items-end gap-1.5">
            <div className="min-w-0 rounded-2xl rounded-tl-sm bg-bubble-other px-4 py-2.5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">
                {message.text}
              </p>
              {message.attachmentUrl && message.attachmentType && (
                <AttachmentPreview
                  url={message.attachmentUrl}
                  type={message.attachmentType}
                  fileName={message.attachmentName}
                  onImageClick={() => onImageClick(message.attachmentUrl!)}
                  variant="light"
                />
              )}
            </div>
            <span className="shrink-0 pb-0.5 text-[10px] text-text-secondary">
              {formatLINETime(message.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MemberTalkPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState(DUMMY_MESSAGES)
  const [readBroadcasts, setReadBroadcasts] = useState<Set<string>>(() => {
    const userReads = DUMMY_READ_STATUSES.filter((r) => r.userId === user?.uid)
    return new Set(userReads.map((r) => r.broadcastId))
  })
  const [openBroadcast, setOpenBroadcast] = useState<Broadcast | null>(null)
  const [showAbsenceForm, setShowAbsenceForm] = useState(false)
  const [inputText, setInputText] = useState('')
  const [showRichMenu, setShowRichMenu] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ messageId: string; x: number; y: number } | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [pendingAttachment, setPendingAttachment] = useState<{ file: File; url: string; type: 'image' | 'pdf' } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // ユーザーに関係する配信のみ (sent + recalled)
  const visibleBroadcasts = useMemo(
    () =>
      DUMMY_BROADCASTS.filter(
        (bc) =>
          (bc.status === 'sent' || bc.status === 'recalled') &&
          (bc.targetType === 'all' ||
            (bc.targetType === 'class' && user && bc.targetClassIds.includes(user.classId)))
      ),
    [user]
  )

  // 未読の重要お知らせ
  const unreadImportant = visibleBroadcasts.filter(
    (bc) => bc.isImportant && !readBroadcasts.has(bc.id) && bc.status === 'sent'
  )

  // タイムラインを時系列で統合
  const timeline = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = []
    visibleBroadcasts.forEach((bc) =>
      items.push({ kind: 'broadcast', data: bc, time: bc.sentAt ?? bc.createdAt })
    )
    messages
      .filter(
        (m) =>
          !m.isScheduled &&
          (m.senderUid === user?.uid ||
            m.recipientUid === user?.uid)
      )
      .forEach((m) => items.push({ kind: 'message', data: m, time: m.createdAt }))
    return items.sort((a, b) => a.time.getTime() - b.time.getTime())
  }, [visibleBroadcasts, messages, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [timeline])

  const handleOpenBroadcast = (bc: Broadcast) => {
    setOpenBroadcast(bc)
    setReadBroadcasts((prev) => new Set(prev).add(bc.id))
  }

  const handleSendMessage = () => {
    if ((!inputText.trim() && !pendingAttachment) || !user) return
    const newMsg: Message = {
      id: String(Date.now()),
      text: inputText.trim(),
      type: 'text',
      senderUid: user.uid,
      senderName: user.name,
      senderRole: user.role,
      recipientUid: 'admin-001',
      attachmentUrl: pendingAttachment?.url,
      attachmentType: pendingAttachment?.type,
      attachmentName: pendingAttachment?.file.name,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, newMsg])
    setInputText('')
    setPendingAttachment(null)
    setShowRichMenu(false)
  }

  const handleAbsenceSubmit = (data: { date: string; reason: string; note: string }) => {
    if (!user) return
    const absenceMsg: Message = {
      id: String(Date.now()),
      text: `${data.date} のお休み連絡`,
      type: 'absence',
      senderUid: user.uid,
      senderName: user.name,
      senderRole: 'member',
      recipientUid: 'admin-001',
      absenceDate: data.date,
      absenceReason: data.reason,
      absenceNote: data.note || undefined,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, absenceMsg])
    setShowAbsenceForm(false)
    setShowRichMenu(false)
  }

  const handleUnsend = (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true, deletedAt: new Date() } : m))
    setContextMenu(null)
  }

  const handleContextMenu = useCallback((messageId: string, x: number, y: number) => {
    setContextMenu({ messageId, x, y })
  }, [])

  const handleImageClick = useCallback((url: string) => {
    setPreviewImage(url)
  }, [])

  const handleFileSelect = useCallback((file: File, previewUrl: string, fileType: 'image' | 'pdf') => {
    setPendingAttachment({ file, url: previewUrl, type: fileType })
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const contextMessage = contextMenu
    ? messages.find((m) => m.id === contextMenu.messageId)
    : null

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-border bg-bg-card px-4">
        <h1 className="text-base font-bold text-text">トーク</h1>
      </header>

      {/* Unread important toast */}
      {unreadImportant.length > 0 && (
        <button
          onClick={() => handleOpenBroadcast(unreadImportant[0])}
          className="mx-4 mt-2 flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2 text-left transition-colors hover:bg-accent/10"
        >
          <Bell size={16} className="shrink-0 text-accent" />
          <span className="flex-1 truncate text-xs font-bold text-accent">
            {unreadImportant[0].title}
          </span>
          <span className="shrink-0 text-[10px] text-accent/70">
            {unreadImportant.length > 1 ? `他${unreadImportant.length - 1}件` : 'タップで確認'}
          </span>
        </button>
      )}

      {/* Timeline */}
      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        {timeline.map((item, index) => {
          const prevTime = index > 0 ? timeline[index - 1].time : null
          const showDate = !prevTime || !isSameDay(prevTime, item.time)
          const key = item.kind === 'broadcast' ? `bc-${item.data.id}` : `msg-${item.data.id}`

          return (
            <Fragment key={key}>
              {showDate && (
                <div className="flex justify-center py-3">
                  <span className="rounded-full bg-bg px-3 py-1 text-[11px] font-medium text-text-secondary">
                    {formatDateSeparator(item.time)}
                  </span>
                </div>
              )}
              {item.kind === 'broadcast' ? (
                item.data.status === 'recalled' ? (
                  <div className="px-4 py-2">
                    <div className="flex items-center gap-2 rounded-2xl border border-border bg-bg px-4 py-3">
                      <Ban size={14} className="text-text-secondary" />
                      <span className="text-sm italic text-text-secondary">
                        この配信は取り消されました
                      </span>
                    </div>
                  </div>
                ) : (
                  <BroadcastCard
                    broadcast={item.data}
                    isRead={readBroadcasts.has(item.data.id)}
                    onOpen={handleOpenBroadcast}
                  />
                )
              ) : (
                <ChatBubble
                  message={item.data}
                  isMine={item.data.senderUid === user?.uid}
                  onLongPress={handleContextMenu}
                  onImageClick={handleImageClick}
                />
              )}
            </Fragment>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Rich menu (toggle) */}
      {showRichMenu && (
        <div className="border-t border-border bg-bg px-4 py-3">
          <button
            onClick={() => {
              setShowAbsenceForm(true)
              setShowRichMenu(false)
            }}
            className="flex items-center gap-2 rounded-xl border border-border bg-bg-card px-4 py-3 text-sm font-medium text-text transition-colors hover:bg-bg"
          >
            <CalendarOff size={18} className="text-danger" />
            お休み連絡
          </button>
        </div>
      )}

      {/* Pending attachment preview strip */}
      {pendingAttachment && (
        <div className="border-t border-border bg-bg px-3 py-2">
          <div className="flex items-center gap-2">
            {pendingAttachment.type === 'image' ? (
              <img
                src={pendingAttachment.url}
                alt="添付プレビュー"
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-bg-card">
                <span className="text-[10px] font-bold text-primary">PDF</span>
              </div>
            )}
            <span className="flex-1 truncate text-xs text-text-secondary">
              {pendingAttachment.file.name}
            </span>
            <button
              onClick={() => setPendingAttachment(null)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-card text-text-secondary hover:bg-border"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-border bg-bg-card px-3 py-2">
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowRichMenu(!showRichMenu)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${
              showRichMenu ? 'bg-primary text-white' : 'bg-bg text-text-secondary hover:bg-border'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="12" y1="3" x2="12" y2="12" />
            </svg>
          </button>
          <FileAttachmentButton onFileSelect={handleFileSelect} />
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowRichMenu(false)}
            placeholder="メッセージを入力..."
            rows={1}
            className="max-h-24 min-h-[44px] flex-1 resize-none rounded-full border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() && !pendingAttachment}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary transition-opacity disabled:opacity-30"
          >
            <SendHorizontal size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {openBroadcast && (
        <BroadcastDetailModal
          broadcast={openBroadcast}
          onClose={() => setOpenBroadcast(null)}
        />
      )}
      {showAbsenceForm && (
        <AbsenceForm
          onClose={() => setShowAbsenceForm(false)}
          onSubmit={handleAbsenceSubmit}
        />
      )}
      {contextMenu && contextMessage && user && (
        <MessageContextMenu
          message={contextMessage}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          currentUserUid={user.uid}
          onUnsend={handleUnsend}
          onCopy={(text) => {
            navigator.clipboard.writeText(text)
            setContextMenu(null)
          }}
          onClose={() => setContextMenu(null)}
        />
      )}
      {previewImage && (
        <ImagePreviewModal
          url={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  )
}
