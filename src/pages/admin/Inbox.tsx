import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  SendHorizontal,
  CalendarOff,
  Ban,
  Clock,
  FileText,
  Pencil,
  Trash2,
  X,
  Paperclip,
} from 'lucide-react'
import type { Message, TemplateMessage } from '../../types'
import { AbsenceCard } from '../../components/AbsenceCard'
import { AttachmentPreview } from '../../components/AttachmentPreview'
import { ImagePreviewModal } from '../../components/ImagePreviewModal'
import { FileAttachmentButton } from '../../components/FileAttachmentButton'
import { MessageContextMenu } from '../../components/MessageContextMenu'
import { TemplateMessagePanel } from '../../components/TemplateMessagePanel'
import { TemplateManager } from '../../components/TemplateManager'
import {
  DEFAULT_TEMPLATES,
  DUMMY_MEMBERS,
  DUMMY_MESSAGES,
  DUMMY_ABSENCES,
  getClassLabel,
  getMemberClassrooms,
} from '../../lib/dummyData'

function formatTime(date: Date): string {
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function AdminInbox() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedMember, setSelectedMember] = useState<
    (typeof DUMMY_MEMBERS)[number] | null
  >(null)
  const [messages, setMessages] = useState<Message[]>(DUMMY_MESSAGES)

  // Handle ?member=uid from MemberManagement navigation
  useEffect(() => {
    const memberUid = searchParams.get('member')
    if (memberUid) {
      const member = DUMMY_MEMBERS.find((m) => m.uid === memberUid)
      if (member) setSelectedMember(member)
      setSearchParams({}, { replace: true })
    } else if (!selectedMember) {
      // Default: select first member that has messages
      const firstWithMsg = DUMMY_MEMBERS.find((m) =>
        DUMMY_MESSAGES.some((msg) => msg.senderUid === m.uid || msg.recipientUid === m.uid)
      )
      if (firstWithMsg) setSelectedMember(firstWithMsg)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [inputText, setInputText] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'absence'>('all')

  // Feature 14: Member search
  const [searchQuery, setSearchQuery] = useState('')

  // Feature: File attachments
  const [pendingAttachment, setPendingAttachment] = useState<{
    file: File
    url: string
    type: 'image' | 'pdf'
  } | null>(null)

  // Feature 3: Scheduled messages
  const [scheduledTime, setScheduledTime] = useState('')
  const [showSchedulePicker, setShowSchedulePicker] = useState(false)
  const [editingMessage, setEditingMessage] = useState<string | null>(null)

  // Features 4, 5: Template messages
  const [templates, setTemplates] = useState<TemplateMessage[]>(DEFAULT_TEMPLATES)
  const [showTemplatePanel, setShowTemplatePanel] = useState(false)
  const [showTemplateManager, setShowTemplateManager] = useState(false)

  // Feature 6: Message context menu / unsend
  const [contextMenu, setContextMenu] = useState<{
    messageId: string
    x: number
    y: number
  } | null>(null)

  // Feature 7: Image preview
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // --- Helpers ---
  const getLastMessage = (uid: string) => {
    const memberMsgs = messages.filter(
      (m) => m.senderUid === uid || m.recipientUid === uid
    )
    return memberMsgs[memberMsgs.length - 1]
  }

  const getMemberAbsences = (uid: string) =>
    DUMMY_ABSENCES.filter((a) => a.userId === uid)

  // --- Filtered + searched members ---
  const filteredMembers = DUMMY_MEMBERS.filter((m) => {
    // Only show members that have messages (or are specifically searched/navigated to)
    const hasMessages = messages.some(
      (msg) => msg.senderUid === m.uid || msg.recipientUid === m.uid
    )

    // Apply tab filter
    if (filter === 'absence') {
      if (getMemberAbsences(m.uid).length === 0) return false
    } else if (filter === 'unread') {
      if (getLastMessage(m.uid)?.senderRole !== 'member') return false
    } else {
      // "all" tab: only show members with messages
      if (!hasMessages) return false
    }

    // Apply search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      const nameMatch = m.name.toLowerCase().includes(q)
      const kanaMatch = m.nameKana.toLowerCase().includes(q)
      const classroomNames = getMemberClassrooms(m.uid).map((c) =>
        c.name.toLowerCase()
      )
      const classMatch = classroomNames.some((cn) => cn.includes(q))
      if (!nameMatch && !kanaMatch && !classMatch) return false
    }

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

  // --- Handlers ---
  const handleSend = () => {
    if ((!inputText.trim() && !pendingAttachment) || !selectedMember) return

    const newMsg: Message = {
      id: String(Date.now()),
      text: inputText.trim(),
      type: 'text',
      senderUid: 'admin-001',
      senderName: '田中コーチ',
      senderRole: 'admin',
      recipientUid: selectedMember.uid,
      createdAt: new Date(),
      ...(pendingAttachment && {
        attachmentUrl: pendingAttachment.url,
        attachmentType: pendingAttachment.type,
        attachmentName: pendingAttachment.file.name,
      }),
      ...(scheduledTime && {
        isScheduled: true,
        scheduledAt: new Date(scheduledTime),
      }),
    }

    setMessages((prev) => [...prev, newMsg])
    setInputText('')
    setPendingAttachment(null)
    setScheduledTime('')
    setShowSchedulePicker(false)
  }

  const handleUnsend = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, isDeleted: true, deletedAt: new Date() } : m
      )
    )
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleContextMenu = (e: React.MouseEvent, msgId: string) => {
    e.preventDefault()
    setContextMenu({ messageId: msgId, x: e.clientX, y: e.clientY })
  }

  const handleDeleteScheduled = (msgId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId))
  }

  const handleEditScheduled = (msgId: string) => {
    setEditingMessage(msgId)
  }

  const handleSaveEdit = (msgId: string, newText: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, text: newText } : m))
    )
    setEditingMessage(null)
  }

  const handleFileSelect = (
    file: File,
    previewUrl: string,
    fileType: 'image' | 'pdf'
  ) => {
    setPendingAttachment({ file, url: previewUrl, type: fileType })
  }

  const handleTemplateSelect = (text: string) => {
    setInputText(text)
    setShowTemplatePanel(false)
  }

  return (
    <div className="flex h-screen">
      {/* Left: Member list */}
      <div className="flex w-72 shrink-0 flex-col border-r border-border bg-bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="mb-2 text-sm font-bold text-text">インボックス</h2>

          {/* Search input */}
          <div className="relative mb-2">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="名前・教室で検索..."
              className="w-full rounded-lg border border-border bg-bg py-1.5 pl-8 pr-3 text-xs text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Filter buttons */}
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
                    <span className="text-sm font-semibold text-text">
                      {member.name}
                    </span>
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
              <h3 className="text-sm font-bold text-text">
                {selectedMember.name}
              </h3>
              <span className="text-xs text-text-secondary">
                {getClassLabel(selectedMember.classId)}
              </span>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {chatMessages.map((msg) => {
                const isAdmin = msg.senderRole === 'admin'

                // System messages
                if (msg.type === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <span className="rounded-full bg-bg px-3 py-1 text-xs text-text-secondary">
                        {msg.text}
                      </span>
                    </div>
                  )
                }

                // Absence messages
                if (msg.type === 'absence') {
                  return <AbsenceCard key={msg.id} message={msg} />
                }

                // Deleted messages
                if (msg.isDeleted) {
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-center gap-1.5 rounded-2xl bg-bg px-4 py-2.5">
                        <Ban size={14} className="text-text-secondary" />
                        <p className="text-sm italic text-text-secondary">
                          このメッセージは取り消されました
                        </p>
                      </div>
                    </div>
                  )
                }

                // Scheduled messages
                if (msg.isScheduled) {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div
                        className="group relative max-w-[70%] rounded-2xl rounded-tr-sm border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-2.5"
                        onContextMenu={(e) => handleContextMenu(e, msg.id)}
                      >
                        <div className="mb-1 flex items-center gap-1.5">
                          <Clock size={12} className="text-primary" />
                          <span className="text-[10px] font-medium text-primary">
                            予約済み:{' '}
                            {msg.scheduledAt
                              ? `${msg.scheduledAt.getMonth() + 1}/${msg.scheduledAt.getDate()} ${formatTime(msg.scheduledAt)}`
                              : ''}
                          </span>
                        </div>
                        {editingMessage === msg.id ? (
                          <div className="flex gap-1">
                            <input
                              type="text"
                              defaultValue={msg.text}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveEdit(
                                    msg.id,
                                    (e.target as HTMLInputElement).value
                                  )
                                }
                                if (e.key === 'Escape') {
                                  setEditingMessage(null)
                                }
                              }}
                              autoFocus
                              className="flex-1 rounded border border-border bg-bg px-2 py-1 text-sm text-text focus:border-primary focus:outline-none"
                            />
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm text-text">
                            {msg.text}
                          </p>
                        )}
                        {msg.attachmentUrl && msg.attachmentType && (
                          <AttachmentPreview
                            url={msg.attachmentUrl}
                            type={msg.attachmentType}
                            fileName={msg.attachmentName}
                            onImageClick={() =>
                              setPreviewImage(msg.attachmentUrl ?? null)
                            }
                          />
                        )}
                        {/* Edit/Delete buttons on hover */}
                        <div className="absolute -right-1 -top-3 hidden items-center gap-0.5 group-hover:flex">
                          <button
                            onClick={() => handleEditScheduled(msg.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-card shadow-sm border border-border hover:bg-bg"
                          >
                            <Pencil size={11} className="text-text-secondary" />
                          </button>
                          <button
                            onClick={() => handleDeleteScheduled(msg.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-card shadow-sm border border-border hover:bg-danger/10"
                          >
                            <Trash2 size={11} className="text-danger" />
                          </button>
                        </div>
                        <p className="mt-1 text-[10px] text-text-secondary">
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                }

                // Normal messages
                // For admin messages, check if the member has read it
                // (heuristic: member sent a message after this admin message)
                const isRead = isAdmin && chatMessages.some(
                  (m) => m.senderRole === 'member' && m.createdAt > msg.createdAt
                )

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div>
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                          isAdmin
                            ? 'ml-auto rounded-tr-sm bg-primary text-white'
                            : 'rounded-tl-sm bg-bubble-other text-text'
                        }`}
                        onContextMenu={(e) => handleContextMenu(e, msg.id)}
                      >
                        <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                        {msg.attachmentUrl && msg.attachmentType && (
                          <AttachmentPreview
                            url={msg.attachmentUrl}
                            type={msg.attachmentType}
                            fileName={msg.attachmentName}
                            onImageClick={() =>
                              setPreviewImage(msg.attachmentUrl ?? null)
                            }
                            variant={isAdmin ? 'dark' : 'light'}
                          />
                        )}
                        <p
                          className={`mt-1 text-[10px] ${
                            isAdmin ? 'text-white/60' : 'text-text-secondary'
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                      {isAdmin && (
                        <p className={`mt-0.5 text-right text-[10px] ${isRead ? 'text-primary' : 'text-text-secondary'}`}>
                          {isRead ? '既読' : '未読'}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input area */}
            <div className="border-t border-border">
              {/* Template panel (conditional) */}
              {showTemplatePanel && (
                <TemplateMessagePanel
                  templates={templates}
                  onSelect={handleTemplateSelect}
                  onClose={() => setShowTemplatePanel(false)}
                  onManage={() => {
                    setShowTemplatePanel(false)
                    setShowTemplateManager(true)
                  }}
                />
              )}

              {/* Schedule picker (conditional) */}
              {showSchedulePicker && (
                <div className="border-t border-border bg-bg-card px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-primary" />
                    <span className="text-xs font-medium text-text">送信予約:</span>
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="rounded-lg border border-border bg-bg px-2 py-1 text-xs text-text focus:border-primary focus:outline-none"
                    />
                    {scheduledTime && (
                      <button
                        onClick={() => {
                          setScheduledTime('')
                          setShowSchedulePicker(false)
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-bg"
                      >
                        <X size={14} className="text-text-secondary" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Pending attachment preview (conditional) */}
              {pendingAttachment && (
                <div className="border-t border-border bg-bg-card px-4 py-2">
                  <div className="flex items-center gap-2">
                    {pendingAttachment.type === 'image' ? (
                      <img
                        src={pendingAttachment.url}
                        alt="添付プレビュー"
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-bg px-3 py-2">
                        <Paperclip size={14} className="text-primary" />
                        <span className="text-xs text-text">
                          {pendingAttachment.file.name}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => setPendingAttachment(null)}
                      className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-bg"
                    >
                      <X size={14} className="text-text-secondary" />
                    </button>
                  </div>
                </div>
              )}

              {/* Input row */}
              <div className="p-3">
                <div className="flex items-center gap-2">
                  {/* Template button */}
                  <button
                    onClick={() => setShowTemplatePanel((prev) => !prev)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg text-text-secondary transition-colors hover:bg-border"
                    title="定型文"
                  >
                    <FileText size={18} />
                  </button>

                  {/* File attachment button */}
                  <FileAttachmentButton onFileSelect={handleFileSelect} />

                  {/* Text input */}
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

                  {/* Clock button (schedule) */}
                  <button
                    onClick={() => setShowSchedulePicker((prev) => !prev)}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                      scheduledTime
                        ? 'bg-primary text-white'
                        : 'bg-bg text-text-secondary hover:bg-border'
                    }`}
                    title="予約送信"
                  >
                    <Clock size={18} />
                  </button>

                  {/* Send / scheduled send button */}
                  {scheduledTime ? (
                    <button
                      onClick={handleSend}
                      disabled={!inputText.trim() && !pendingAttachment}
                      className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-30"
                    >
                      予約送信
                    </button>
                  ) : (
                    <button
                      onClick={handleSend}
                      disabled={!inputText.trim() && !pendingAttachment}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary transition-opacity disabled:opacity-30"
                    >
                      <SendHorizontal size={16} className="text-white" />
                    </button>
                  )}
                </div>
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
            <h4 className="mb-2 text-xs font-bold text-text-secondary">
              お休み履歴
            </h4>
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
            <h4 className="mb-2 text-xs font-bold text-text-secondary">
              会員情報
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between rounded-lg bg-bg px-3 py-2">
                <span className="text-text-secondary">登録日</span>
                <span className="text-text">
                  {selectedMember.createdAt.getFullYear()}/
                  {selectedMember.createdAt.getMonth() + 1}/
                  {selectedMember.createdAt.getDate()}
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

      {/* Context menu */}
      {contextMenu && (() => {
        const targetMsg = messages.find((m) => m.id === contextMenu.messageId)
        if (!targetMsg) return null
        return (
          <MessageContextMenu
            message={targetMsg}
            position={{ x: contextMenu.x, y: contextMenu.y }}
            currentUserUid="admin-001"
            onUnsend={handleUnsend}
            onCopy={handleCopy}
            onClose={() => setContextMenu(null)}
          />
        )
      })()}

      {/* Template manager modal */}
      {showTemplateManager && (
        <TemplateManager
          templates={templates}
          onUpdate={setTemplates}
          onClose={() => setShowTemplateManager(false)}
        />
      )}

      {/* Image preview modal */}
      {previewImage && (
        <ImagePreviewModal
          url={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  )
}
