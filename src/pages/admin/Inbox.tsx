import { useState } from 'react'
import { SendHorizontal, CalendarOff } from 'lucide-react'
import {
  DUMMY_MEMBERS,
  DUMMY_MESSAGES,
  DUMMY_ABSENCES,
  getClassLabel,
} from '../../lib/dummyData'
import type { Message, User } from '../../types'

function formatTime(date: Date): string {
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function AdminInbox() {
  const [selectedMember, setSelectedMember] = useState<User | null>(DUMMY_MEMBERS[0])
  const [messages, setMessages] = useState(DUMMY_MESSAGES)
  const [inputText, setInputText] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'absence'>('all')

  const getLastMessage = (uid: string) => {
    const memberMsgs = messages.filter(
      (m) => m.senderUid === uid || m.recipientUid === uid
    )
    return memberMsgs[memberMsgs.length - 1]
  }

  const getMemberAbsences = (uid: string) =>
    DUMMY_ABSENCES.filter((a) => a.userId === uid)

  const filteredMembers = DUMMY_MEMBERS.filter((m) => {
    if (filter === 'absence') return getMemberAbsences(m.uid).length > 0
    if (filter === 'unread') return getLastMessage(m.uid)?.senderRole === 'member'
    return true
  })

  const chatMessages = selectedMember
    ? messages.filter(
        (m) =>
          m.senderUid === selectedMember.uid ||
          m.recipientUid === selectedMember.uid
      )
    : []

  const selectedAbsences = selectedMember
    ? getMemberAbsences(selectedMember.uid)
    : []

  const handleSend = () => {
    if (!inputText.trim() || !selectedMember) return
    const newMsg: Message = {
      id: String(Date.now()),
      text: inputText.trim(),
      type: 'text',
      senderUid: 'admin-001',
      senderName: '田中コーチ',
      senderRole: 'admin',
      recipientUid: selectedMember.uid,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, newMsg])
    setInputText('')
  }

  return (
    <div className="flex h-screen">
      {/* Left: Member list */}
      <div className="flex w-72 shrink-0 flex-col border-r border-border bg-bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="mb-2 text-sm font-bold text-text">インボックス</h2>
          <div className="flex gap-1">
            {(['all', 'unread', 'absence'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-bg text-text-secondary hover:bg-border'
                }`}
              >
                {f === 'all' ? '全て' : f === 'unread' ? '未読' : 'お休み'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredMembers.map((member) => {
            const lastMsg = getLastMessage(member.uid)
            const isSelected = selectedMember?.uid === member.uid
            const hasAbsence = getMemberAbsences(member.uid).length > 0

            return (
              <button
                key={member.uid}
                onClick={() => setSelectedMember(member)}
                className={`flex w-full items-start gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors ${
                  isSelected ? 'bg-primary/5' : 'hover:bg-bg'
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {member.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text">{member.name}</span>
                    {hasAbsence && (
                      <CalendarOff size={13} className="text-danger" />
                    )}
                  </div>
                  <p className="truncate text-xs text-text-secondary">
                    {lastMsg?.text ?? 'メッセージなし'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Center: Chat */}
      <div className="flex flex-1 flex-col">
        {selectedMember ? (
          <>
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-bold text-text">{selectedMember.name}</h3>
              <span className="text-xs text-text-secondary">{getClassLabel(selectedMember.classId)}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {chatMessages.map((msg) => {
                const isAdmin = msg.senderRole === 'admin'
                if (msg.type === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <span className="rounded-full bg-bg px-3 py-1 text-xs text-text-secondary">
                        {msg.text}
                      </span>
                    </div>
                  )
                }
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      isAdmin
                        ? 'rounded-tr-sm bg-primary text-white'
                        : 'rounded-tl-sm bg-bubble-other text-text'
                    }`}>
                      <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                      <p className={`mt-1 text-[10px] ${isAdmin ? 'text-white/60' : 'text-text-secondary'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-border p-3">
              <div className="flex gap-2">
                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="メッセージを入力..."
                  className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary transition-opacity disabled:opacity-30"
                >
                  <SendHorizontal size={16} className="text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-text-secondary">会員を選択してください</p>
          </div>
        )}
      </div>

      {/* Right: Member detail */}
      {selectedMember && (
        <div className="w-72 shrink-0 overflow-y-auto border-l border-border bg-bg-card p-4">
          <div className="mb-4 text-center">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
              {selectedMember.name.charAt(0)}
            </div>
            <h3 className="font-bold text-text">{selectedMember.name}</h3>
            <p className="text-xs text-text-secondary">{selectedMember.email}</p>
            <span className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              {getClassLabel(selectedMember.classId)}
            </span>
          </div>

          {/* Absences */}
          <div className="mb-4">
            <h4 className="mb-2 text-xs font-bold text-text-secondary">お休み履歴</h4>
            {selectedAbsences.length === 0 ? (
              <p className="text-xs text-text-secondary">なし</p>
            ) : (
              <div className="space-y-1.5">
                {selectedAbsences.map((a) => (
                  <div key={a.id} className="rounded-lg bg-bg px-3 py-2">
                    <p className="text-xs font-medium text-text">
                      {a.date.getMonth() + 1}/{a.date.getDate()} - {a.reason}
                    </p>
                    {a.note && (
                      <p className="text-[11px] text-text-secondary">{a.note}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Member info */}
          <div>
            <h4 className="mb-2 text-xs font-bold text-text-secondary">会員情報</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between rounded-lg bg-bg px-3 py-2">
                <span className="text-text-secondary">登録日</span>
                <span className="text-text">
                  {selectedMember.createdAt.getFullYear()}/{selectedMember.createdAt.getMonth() + 1}/{selectedMember.createdAt.getDate()}
                </span>
              </div>
              <div className="flex justify-between rounded-lg bg-bg px-3 py-2">
                <span className="text-text-secondary">UID</span>
                <span className="font-mono text-text">{selectedMember.uid}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
