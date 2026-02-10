import { useState, useRef, useEffect } from 'react'
import { Header } from '../components/Header'
import { ComposeModal } from '../components/ComposeModal'
import { useAuth } from '../hooks/useAuth'
import { CheckCheck, Paperclip, AlertTriangle, Plus, SendHorizontal } from 'lucide-react'
import type { Message } from '../types'

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: '【重要】来週の練習スケジュール変更のお知らせ\n\n来週の水曜日（2/11）は祝日のため、練習はお休みとなります。振替練習は2/14（土）10:00〜12:00に実施します。',
    targetClassId: 'all',
    isImportant: true,
    senderUid: 'admin-001',
    senderName: '田中コーチ',
    senderRole: 'admin',
    createdAt: new Date('2026-02-07T09:00:00'),
  },
  {
    id: '2',
    text: '承知しました！振替練習の件、了解です。',
    targetClassId: 'all',
    isImportant: false,
    senderUid: 'member-001',
    senderName: '山田 太郎',
    senderRole: 'member',
    createdAt: new Date('2026-02-07T09:15:00'),
  },
  {
    id: '3',
    text: '今日の練習お疲れ様でした！来週からドリブル強化週間に入ります。自主練でもボールタッチの練習をしておいてください。',
    targetClassId: 'class-a',
    isImportant: false,
    senderUid: 'admin-002',
    senderName: '佐藤コーチ',
    senderRole: 'admin',
    createdAt: new Date('2026-02-06T18:30:00'),
  },
  {
    id: '4',
    text: '3月の大会エントリーを受付中です。参加希望の方は今週中に申請フォームから申し込みをお願いします。',
    targetClassId: 'all',
    isImportant: false,
    senderUid: 'admin-001',
    senderName: '田中コーチ',
    senderRole: 'admin',
    createdAt: new Date('2026-02-05T12:00:00'),
  },
  {
    id: '5',
    text: '花子を参加させたいです。申し込みしました！',
    targetClassId: 'all',
    isImportant: false,
    senderUid: 'member-001',
    senderName: '山田 太郎',
    senderRole: 'member',
    createdAt: new Date('2026-02-05T13:00:00'),
  },
  {
    id: '6',
    text: '本日の練習場所が変更になりました。\n第2グラウンド → 体育館\n\n雨天のためご注意ください。室内シューズを忘れずに持参してください。',
    targetClassId: 'all',
    isImportant: true,
    senderUid: 'admin-001',
    senderName: '田中コーチ',
    senderRole: 'admin',
    createdAt: new Date('2026-02-04T07:30:00'),
  },
  {
    id: '7',
    text: '新しいユニフォームのデザイン案を添付しました。ご意見がある方はこちらに返信ください。',
    attachmentUrl: '#',
    attachmentType: 'image',
    targetClassId: 'all',
    isImportant: false,
    senderUid: 'admin-002',
    senderName: '佐藤コーチ',
    senderRole: 'admin',
    createdAt: new Date('2026-02-03T14:00:00'),
  },
]

function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  if (days === 1) return '昨日'
  if (days < 7) return `${days}日前`
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function MessageBubble({ message, isMine }: { message: Message; isMine: boolean }) {
  if (isMine) {
    // 自分のメッセージ → 右寄せ
    return (
      <div className="flex justify-end px-4 py-1.5">
        <div className="flex max-w-[75%] flex-col items-end">
          <div className="rounded-2xl rounded-tr-sm bg-bubble-mine px-4 py-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-white">
              {message.text}
            </p>
            {message.attachmentUrl && (
              <div className="mt-2 flex items-center gap-1.5 text-white/70">
                <Paperclip size={14} />
                <span className="text-xs font-medium">添付ファイル</span>
              </div>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1">
            <span className="text-[10px] text-text-secondary">
              {formatDate(message.createdAt)}
            </span>
            <CheckCheck size={12} className="text-primary" />
          </div>
        </div>
      </div>
    )
  }

  // 相手のメッセージ → 左寄せ（アイコン+名前）
  return (
    <div className="flex justify-start px-4 py-1.5">
      <div className="flex max-w-[80%] items-start gap-2.5">
        {/* Avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {message.senderName.charAt(0)}
        </div>

        <div className="min-w-0">
          {/* Sender name */}
          <span className="mb-1 block text-xs font-semibold text-text-secondary">
            {message.senderName}
          </span>

          {/* Bubble */}
          <div
            className={`rounded-2xl rounded-tl-sm px-4 py-3 ${
              message.isImportant
                ? 'border border-accent/30 bg-accent/5'
                : 'bg-bubble-other'
            }`}
          >
            {message.isImportant && (
              <div className="mb-1.5 flex items-center gap-1 text-accent">
                <AlertTriangle size={14} />
                <span className="text-xs font-bold">重要</span>
              </div>
            )}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">
              {message.text}
            </p>
            {message.attachmentUrl && (
              <div className="mt-2 flex items-center gap-1.5 text-primary">
                <Paperclip size={14} />
                <span className="text-xs font-medium">添付ファイル</span>
              </div>
            )}
          </div>

          {/* Time */}
          <span className="mt-0.5 block text-[10px] text-text-secondary">
            {formatDate(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function TalkPage() {
  const { user, isAdmin } = useAuth()
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [showCompose, setShowCompose] = useState(false)
  const [inputText, setInputText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!inputText.trim() || !user) return
    const newMessage: Message = {
      id: String(Date.now()),
      text: inputText.trim(),
      targetClassId: 'all',
      isImportant: false,
      senderUid: user.uid,
      senderName: user.name,
      senderRole: user.role,
      createdAt: new Date(),
    }
    setMessages([...messages, newMessage])
    setInputText('')
  }

  const handleAdminCompose = (data: {
    text: string
    targetClassId: string
    isImportant: boolean
    image: File | null
  }) => {
    if (!user) return
    const newMessage: Message = {
      id: String(Date.now()),
      text: data.text,
      targetClassId: data.targetClassId,
      isImportant: data.isImportant,
      senderUid: user.uid,
      senderName: user.name,
      senderRole: 'admin',
      createdAt: new Date(),
      attachmentUrl: data.image ? URL.createObjectURL(data.image) : undefined,
      attachmentType: data.image ? 'image' : undefined,
    }
    setMessages([...messages, newMessage])
    setShowCompose(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-[100dvh] flex-col">
      <Header title="トーク" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-2">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMine={msg.senderUid === user?.uid}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* FAB - 管理者のみ表示 */}
      {isAdmin && (
        <button
          onClick={() => setShowCompose(true)}
          className="absolute bottom-32 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 transition-transform active:scale-90"
        >
          <Plus size={28} className="text-white" />
        </button>
      )}

      {/* Message input bar */}
      <div className="border-t border-border bg-bg-card px-3 py-2 safe-area-bottom">
        <div className="flex items-end gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
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

      {/* 管理者用メッセージ作成モーダル */}
      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onSend={handleAdminCompose}
        />
      )}
    </div>
  )
}
