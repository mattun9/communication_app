import { useState, useRef, useEffect, useMemo } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { BroadcastCard } from '../../components/BroadcastCard'
import { BroadcastDetailModal } from '../../components/BroadcastDetailModal'
import { AbsenceForm } from '../../components/AbsenceForm'
import { SendHorizontal, Paperclip, CalendarOff, Bell } from 'lucide-react'
import {
  DUMMY_BROADCASTS,
  DUMMY_MESSAGES,
  DUMMY_READ_STATUSES,
} from '../../lib/dummyData'
import type { Message, Broadcast } from '../../types'

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  if (days === 1) return '昨日'
  if (days < 7) return `${days}日前`
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// タイムライン上の統合アイテム
type TimelineItem =
  | { kind: 'broadcast'; data: Broadcast; time: Date }
  | { kind: 'message'; data: Message; time: Date }

function ChatBubble({ message, isMine }: { message: Message; isMine: boolean }) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center px-4 py-1.5">
        <div className="rounded-full bg-bg px-4 py-1.5 text-xs text-text-secondary">
          {message.text}
        </div>
      </div>
    )
  }

  if (isMine) {
    return (
      <div className="flex justify-end px-4 py-1">
        <div className="flex max-w-[75%] flex-col items-end">
          <div className="rounded-2xl rounded-tr-sm bg-bubble-mine px-4 py-2.5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-white">
              {message.text}
            </p>
            {message.attachmentUrl && (
              <div className="mt-1.5 flex items-center gap-1 text-white/70">
                <Paperclip size={12} />
                <span className="text-[11px]">添付ファイル</span>
              </div>
            )}
          </div>
          <span className="mt-0.5 text-[10px] text-text-secondary">
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start px-4 py-1">
      <div className="flex max-w-[80%] items-start gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
          {message.senderName.charAt(0)}
        </div>
        <div className="min-w-0">
          <span className="mb-0.5 block text-[11px] font-semibold text-text-secondary">
            {message.senderName}
          </span>
          <div className="rounded-2xl rounded-tl-sm bg-bubble-other px-4 py-2.5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">
              {message.text}
            </p>
            {message.attachmentUrl && (
              <div className="mt-1.5 flex items-center gap-1 text-primary">
                <Paperclip size={12} />
                <span className="text-[11px]">添付ファイル</span>
              </div>
            )}
          </div>
          <span className="mt-0.5 block text-[10px] text-text-secondary">
            {formatTime(message.createdAt)}
          </span>
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
  const bottomRef = useRef<HTMLDivElement>(null)

  // ユーザーに関係する配信のみ
  const visibleBroadcasts = useMemo(
    () =>
      DUMMY_BROADCASTS.filter(
        (bc) =>
          bc.status === 'sent' &&
          (bc.targetType === 'all' ||
            (bc.targetType === 'class' && user && bc.targetClassIds.includes(user.classId)))
      ),
    [user]
  )

  // 未読の重要お知らせ
  const unreadImportant = visibleBroadcasts.filter(
    (bc) => bc.isImportant && !readBroadcasts.has(bc.id)
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
          m.senderUid === user?.uid ||
          m.recipientUid === user?.uid
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
    if (!inputText.trim() || !user) return
    const newMsg: Message = {
      id: String(Date.now()),
      text: inputText.trim(),
      type: 'text',
      senderUid: user.uid,
      senderName: user.name,
      senderRole: user.role,
      recipientUid: 'admin-001',
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, newMsg])
    setInputText('')
    setShowRichMenu(false)
  }

  const handleAbsenceSubmit = (data: { date: string; reason: string; note: string }) => {
    if (!user) return
    const systemMsg: Message = {
      id: String(Date.now()),
      text: `${data.date} のお休み連絡を受け付けました（理由: ${data.reason}）`,
      type: 'system',
      senderUid: 'system',
      senderName: 'システム',
      senderRole: 'admin',
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, systemMsg])
    setShowAbsenceForm(false)
    setShowRichMenu(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

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
        {timeline.map((item) =>
          item.kind === 'broadcast' ? (
            <BroadcastCard
              key={item.data.id}
              broadcast={item.data}
              isRead={readBroadcasts.has(item.data.id)}
              onOpen={handleOpenBroadcast}
            />
          ) : (
            <ChatBubble
              key={item.data.id}
              message={item.data}
              isMine={item.data.senderUid === user?.uid}
            />
          )
        )}
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
            disabled={!inputText.trim()}
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
    </div>
  )
}
