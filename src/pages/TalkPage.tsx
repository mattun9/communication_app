import { useState } from 'react'
import { Header } from '../components/Header'
import { ComposeModal } from '../components/ComposeModal'
import { useAuth } from '../hooks/useAuth'
import { CheckCheck, Paperclip, AlertTriangle, Plus } from 'lucide-react'
import type { Message } from '../types'

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: '【重要】来週の練習スケジュール変更のお知らせ\n\n来週の水曜日（2/11）は祝日のため、練習はお休みとなります。振替練習は2/14（土）10:00〜12:00に実施します。',
    targetClassId: 'all',
    isImportant: true,
    senderName: '田中コーチ',
    senderRole: 'admin',
    createdAt: new Date('2026-02-07T09:00:00'),
  },
  {
    id: '2',
    text: '今日の練習お疲れ様でした！来週からドリブル強化週間に入ります。自主練でもボールタッチの練習をしておいてください。',
    targetClassId: 'class-a',
    isImportant: false,
    senderName: '佐藤コーチ',
    senderRole: 'admin',
    createdAt: new Date('2026-02-06T18:30:00'),
  },
  {
    id: '3',
    text: '3月の大会エントリーを受付中です。参加希望の方は今週中に申請フォームから申し込みをお願いします。',
    targetClassId: 'all',
    isImportant: false,
    senderName: '田中コーチ',
    senderRole: 'admin',
    createdAt: new Date('2026-02-05T12:00:00'),
  },
  {
    id: '4',
    text: '本日の練習場所が変更になりました。\n第2グラウンド → 体育館\n\n雨天のためご注意ください。室内シューズを忘れずに持参してください。',
    targetClassId: 'all',
    isImportant: true,
    senderName: '田中コーチ',
    senderRole: 'admin',
    createdAt: new Date('2026-02-04T07:30:00'),
  },
  {
    id: '5',
    text: '新しいユニフォームのデザイン案を添付しました。ご意見がある方はこちらに返信ください。',
    attachmentUrl: '#',
    attachmentType: 'image',
    targetClassId: 'all',
    isImportant: false,
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

function MessageBubble({ message }: { message: Message }) {
  const [isRead] = useState(message.id !== '1')

  return (
    <div className="px-4 py-2">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          {message.senderName.charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          {/* Sender info */}
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-text">
              {message.senderName}
            </span>
            <span className="text-xs text-text-secondary">
              {formatDate(message.createdAt)}
            </span>
          </div>

          {/* Message bubble */}
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

          {/* Read status */}
          <div className="mt-1 flex justify-end">
            <span className={`flex items-center gap-0.5 text-[10px] ${isRead ? 'text-primary' : 'text-text-secondary'}`}>
              <CheckCheck size={12} />
              {isRead ? '既読' : '未読'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TalkPage() {
  const { user, isAdmin } = useAuth()
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [showCompose, setShowCompose] = useState(false)

  const handleSend = (data: {
    text: string
    targetClassId: string
    isImportant: boolean
    image: File | null
  }) => {
    const newMessage: Message = {
      id: String(Date.now()),
      text: data.text,
      targetClassId: data.targetClassId,
      isImportant: data.isImportant,
      senderName: user?.name ?? '',
      senderRole: 'admin',
      createdAt: new Date(),
      attachmentUrl: data.image ? URL.createObjectURL(data.image) : undefined,
      attachmentType: data.image ? 'image' : undefined,
    }
    setMessages([newMessage, ...messages])
    setShowCompose(false)
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="トーク" />
      <div className="flex-1 divide-y divide-border/50">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* FAB - 管理者のみ表示 */}
      {isAdmin && (
        <button
          onClick={() => setShowCompose(true)}
          className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 transition-transform active:scale-90"
        >
          <Plus size={28} className="text-white" />
        </button>
      )}

      {/* メッセージ作成モーダル */}
      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onSend={handleSend}
        />
      )}
    </div>
  )
}
