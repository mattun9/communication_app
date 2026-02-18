import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  X,
  Send,
  Clock,
  Eye,
  EyeOff,
  ImagePlus,
  AlertTriangle,
  Undo2,
  Pencil,
  Trash2,
  Save,
  Search,
  MessageCircle,
  Mail,
  Phone,
  Filter,
  Hash,
  Users,
} from 'lucide-react'
import {
  useMembers,
  useClassrooms,
  useBroadcasts,
  useClassOptions,
  useTargetMemberCount,
  useTargetMembers,
} from '../../hooks/useData'
import type { Broadcast } from '../../types'

function formatDate(date: Date): string {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

function formatShortDate(date: Date): string {
  const now = new Date()
  const isToday = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
  const time = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  if (isToday) return time
  return `${date.getMonth() + 1}/${date.getDate()} ${time}`
}

// --- 未読者詳細モーダル ---
function ReadDetailModal({ broadcast, onClose }: { broadcast: Broadcast; onClose: () => void }) {
  const navigate = useNavigate()
  const { readStatuses } = useBroadcasts()
  const getTargetMembers = useTargetMembers()
  const [tab, setTab] = useState<'read' | 'unread'>('unread')
  const reads = readStatuses.filter((r) => r.broadcastId === broadcast.id)
  const targetMembers = getTargetMembers(broadcast)
  const unreadMembers = targetMembers.filter(
    (m) => !reads.some((r) => r.userId === m.uid)
  )
  const readMembers = reads
    .map((r) => ({ ...r, member: targetMembers.find((m) => m.uid === r.userId) }))
    .filter((r) => r.member)
    .sort((a, b) => b.openedAt.getTime() - a.openedAt.getTime())

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="mx-4 w-full max-w-md rounded-2xl bg-bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold text-text">
            既読状況 — {reads.length}/{targetMembers.length}名
          </h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-bg">
            <X size={18} />
          </button>
        </div>
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab('unread')}
            className={`flex-1 py-2.5 text-xs font-bold transition-colors ${tab === 'unread' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}
          >
            <EyeOff size={13} className="mb-0.5 inline" /> 未読 ({unreadMembers.length})
          </button>
          <button
            onClick={() => setTab('read')}
            className={`flex-1 py-2.5 text-xs font-bold transition-colors ${tab === 'read' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}
          >
            <Eye size={13} className="mb-0.5 inline" /> 既読 ({reads.length})
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {tab === 'unread' ? (
            unreadMembers.length === 0 ? (
              <p className="py-8 text-center text-xs text-text-secondary">全員開封済み</p>
            ) : (
              unreadMembers.map((m) => (
                <div key={m.uid} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-bg">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text">{m.name}</p>
                      <p className="text-[10px] text-text-secondary">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/admin/inbox?member=${m.uid}`)}
                      title="チャット"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-primary hover:bg-primary/10"
                    >
                      <MessageCircle size={14} />
                    </button>
                    <a
                      href={`mailto:${m.email}`}
                      title="メール"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary hover:bg-bg"
                    >
                      <Mail size={14} />
                    </a>
                    {m.phone && (
                      <a
                        href={`tel:${m.phone}`}
                        title="電話"
                        className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary hover:bg-bg"
                      >
                        <Phone size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )
          ) : (
            readMembers.length === 0 ? (
              <p className="py-8 text-center text-xs text-text-secondary">開封者なし</p>
            ) : (
              readMembers.map((r) => (
                <div key={r.userId} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-bg">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {r.userName.charAt(0)}
                    </div>
                    <p className="text-xs font-medium text-text">{r.userName}</p>
                  </div>
                  <span className="text-[10px] text-text-secondary">{formatDate(r.openedAt)}</span>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  )
}

// --- セグメントラベル ---
function SegmentLabels({ broadcast, variant = 'normal' }: { broadcast: Broadcast; variant?: 'normal' | 'compact' }) {
  const { classrooms } = useClassrooms()
  const { members } = useMembers()

  if (broadcast.targetType === 'all') {
    return (
      <span className={`inline-flex items-center gap-0.5 rounded-full bg-primary/10 font-bold text-primary ${variant === 'compact' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'}`}>
        <Hash size={variant === 'compact' ? 9 : 10} />全体
      </span>
    )
  }
  if (broadcast.targetType === 'class') {
    const labels = broadcast.targetClassIds.map(id => ({
      id,
      label: classrooms.find(c => c.id === id)?.name ?? id,
    }))
    const show = variant === 'compact' ? 1 : 2
    const visible = labels.slice(0, show)
    const rest = labels.length - show
    return (
      <div className="flex flex-wrap items-center gap-1">
        {visible.map(l => (
          <span key={l.id} className={`inline-flex items-center gap-0.5 rounded-full bg-primary/10 font-bold text-primary ${variant === 'compact' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'}`}>
            <Hash size={variant === 'compact' ? 9 : 10} />{l.label}
          </span>
        ))}
        {rest > 0 && (
          <span className={`text-text-secondary ${variant === 'compact' ? 'text-[10px]' : 'text-[11px]'}`}>
            他{rest}件
          </span>
        )}
      </div>
    )
  }
  if (broadcast.targetType === 'individual') {
    const memberNames = (broadcast.targetUserIds ?? []).map(uid => members.find(m => m.uid === uid)?.name ?? uid)
    const show = variant === 'compact' ? 1 : 2
    const visible = memberNames.slice(0, show)
    const rest = memberNames.length - show
    return (
      <div className="flex flex-wrap items-center gap-1">
        {visible.map(name => (
          <span key={name} className={`inline-flex items-center gap-0.5 rounded-full bg-primary/10 font-bold text-primary ${variant === 'compact' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'}`}>
            <Users size={variant === 'compact' ? 9 : 10} />{name}
          </span>
        ))}
        {rest > 0 && (
          <span className={`text-text-secondary ${variant === 'compact' ? 'text-[10px]' : 'text-[11px]'}`}>
            他{rest}名
          </span>
        )}
      </div>
    )
  }
  return <span className="text-[11px] text-text-secondary">個別指定</span>
}

// --- 配信作成モーダル ---
function ComposePanel({ onClose, onSend, onSaveDraft, editingDraft }: {
  onClose: () => void
  onSend: (bc: Omit<Broadcast, 'id' | 'createdAt' | 'createdBy'>) => void
  onSaveDraft: (bc: Omit<Broadcast, 'id' | 'createdAt' | 'createdBy'>) => void
  editingDraft?: Broadcast | null
}) {
  const { members } = useMembers()
  const { classrooms } = useClassrooms()
  const classOptions = useClassOptions()
  const [title, setTitle] = useState(editingDraft?.title ?? '')
  const [body, setBody] = useState(editingDraft?.body ?? '')
  const [targetType, setTargetType] = useState<'all' | 'class' | 'individual'>(
    editingDraft?.targetType ?? 'all'
  )
  const [targetClassIds, setTargetClassIds] = useState<string[]>(editingDraft?.targetClassIds ?? [])
  const [targetUserIds, setTargetUserIds] = useState<string[]>(editingDraft?.targetUserIds ?? [])
  const [memberSearch, setMemberSearch] = useState('')
  const [isImportant, setIsImportant] = useState(editingDraft?.isImportant ?? false)
  const [scheduleMode, setScheduleMode] = useState<'now' | 'scheduled'>(
    editingDraft?.scheduledAt ? 'scheduled' : 'now'
  )
  const [scheduledAt, setScheduledAt] = useState(
    editingDraft?.scheduledAt
      ? new Date(editingDraft.scheduledAt.getTime() - editingDraft.scheduledAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : ''
  )

  const allMembers = members.filter(m => m.role === 'member')
  const filteredMembers = memberSearch.trim()
    ? allMembers.filter(m => m.name.includes(memberSearch) || m.nameKana.includes(memberSearch))
    : allMembers

  const toggleClass = (id: string) => {
    setTargetClassIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const toggleMember = (uid: string) => {
    setTargetUserIds((prev) =>
      prev.includes(uid) ? prev.filter((u) => u !== uid) : [...prev, uid]
    )
  }

  const buildData = (status: Broadcast['status']): Omit<Broadcast, 'id' | 'createdAt' | 'createdBy'> => ({
    title: title.trim(),
    body: body.trim(),
    targetType,
    targetClassIds: targetType === 'class' ? targetClassIds : [],
    targetUserIds: targetType === 'individual' ? targetUserIds : undefined,
    isImportant,
    status,
    sentAt: status === 'sent' ? new Date() : undefined,
    scheduledAt: scheduleMode === 'scheduled' && scheduledAt ? new Date(scheduledAt) : undefined,
  })

  const handleSend = () => {
    if (!title.trim() || !body.trim()) return
    onSend(buildData(scheduleMode === 'now' ? 'sent' : 'scheduled'))
  }

  const handleDraft = () => {
    if (!title.trim()) return
    onSaveDraft(buildData('draft'))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-2xl bg-bg-card shadow-xl" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-bold text-text">新規配信作成</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-bg">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-5" style={{ maxHeight: 'calc(90vh - 130px)' }}>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-secondary">タイトル</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="配信タイトルを入力"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-secondary">配信対象</label>
            <div className="flex gap-2">
              <button onClick={() => setTargetType('all')}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium ${targetType === 'all' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-secondary'}`}>
                全体
              </button>
              <button onClick={() => setTargetType('class')}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium ${targetType === 'class' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-secondary'}`}>
                クラス指定
              </button>
              <button onClick={() => setTargetType('individual')}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium ${targetType === 'individual' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-secondary'}`}>
                個人指定
              </button>
            </div>
            {targetType === 'class' && (
              <div className="mt-2 flex flex-wrap gap-2">
                {classOptions.map((c) => (
                  <button key={c.value} onClick={() => toggleClass(c.value)}
                    className={`rounded-full border-2 px-3 py-1.5 text-xs font-medium ${targetClassIds.includes(c.value) ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-secondary'}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            )}
            {targetType === 'individual' && (
              <div className="mt-2 space-y-2">
                {targetUserIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {targetUserIds.map((uid) => {
                      const m = allMembers.find(member => member.uid === uid)
                      return (
                        <span key={uid} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          {m?.name ?? uid}
                          <button onClick={() => toggleMember(uid)} className="ml-0.5 hover:text-danger">
                            <X size={12} />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input type="text" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="会員名で検索..."
                    className="w-full rounded-lg border border-border bg-bg py-2 pl-8 pr-3 text-xs text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none" />
                </div>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-border">
                  {filteredMembers.map((m) => (
                    <button key={m.uid} onClick={() => toggleMember(m.uid)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-bg ${targetUserIds.includes(m.uid) ? 'bg-primary/5' : ''}`}>
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                        {m.name.charAt(0)}
                      </div>
                      <span className="flex-1 font-medium text-text">{m.name}</span>
                      <span className="text-[10px] text-text-secondary">{classrooms.find(c => c.id === m.classId)?.name}</span>
                      {targetUserIds.includes(m.uid) && (
                        <span className="text-[10px] font-bold text-primary">選択中</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-secondary">本文</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="配信内容を入力..." rows={6}
              className="w-full resize-none rounded-lg border border-border bg-bg p-3 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-secondary">画像（任意）</label>
            <button className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-text-secondary hover:border-primary hover:text-primary">
              <ImagePlus size={18} /> 画像を選択
            </button>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <button onClick={() => setIsImportant(!isImportant)}
                className={`relative h-6 w-10 rounded-full transition-colors ${isImportant ? 'bg-accent' : 'bg-border'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isImportant ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
              <span className="flex items-center gap-1 text-sm text-text">
                <AlertTriangle size={14} className="text-accent" /> 重要
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setScheduleMode(scheduleMode === 'now' ? 'scheduled' : 'now')}
                className={`relative h-6 w-10 rounded-full transition-colors ${scheduleMode === 'scheduled' ? 'bg-primary' : 'bg-border'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${scheduleMode === 'scheduled' ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
              <span className="flex items-center gap-1 text-sm text-text">
                <Clock size={14} /> 予約配信
              </span>
            </div>
          </div>

          {scheduleMode === 'scheduled' && (
            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none" />
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg">
            キャンセル
          </button>
          <button onClick={handleDraft} disabled={!title.trim()}
            className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-opacity hover:bg-bg disabled:opacity-40">
            <Save size={14} /> 下書き保存
          </button>
          <button onClick={handleSend} disabled={!title.trim() || !body.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white transition-opacity disabled:opacity-40">
            <Send size={14} /> {scheduleMode === 'now' ? '今すぐ配信' : '予約する'}
          </button>
        </div>
      </div>
    </div>
  )
}

// --- メイン ---
export function AdminBroadcastManager() {
  const { broadcasts, addBroadcast, updateBroadcast, readStatuses } = useBroadcasts()
  const { members } = useMembers()
  const { classrooms } = useClassrooms()
  const classOptions = useClassOptions()
  const getTargetMemberCount = useTargetMemberCount()

  const [selectedId, setSelectedId] = useState<string | null>(broadcasts[0]?.id ?? null)
  const [showCompose, setShowCompose] = useState(false)
  const [editingDraft, setEditingDraft] = useState<Broadcast | null>(null)
  const [tabFilter, setTabFilter] = useState<'sent' | 'scheduled' | 'draft'>('sent')
  const [recallConfirmId, setRecallConfirmId] = useState<string | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Scroll to selected card in right panel
  useEffect(() => {
    if (!selectedId) return
    requestAnimationFrame(() => {
      const el = cardRefs.current[selectedId]
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    })
  }, [selectedId])
  const [showReadDetail, setShowReadDetail] = useState(false)

  // 検索・フィルタ
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterSegment, setFilterSegment] = useState<'all' | 'class'>('all')
  const [filterClassId, setFilterClassId] = useState<string>('')
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false)

  const filtered = useMemo(() => {
    let result = broadcasts.filter((bc) =>
      tabFilter === 'sent' ? bc.status === 'sent' || bc.status === 'recalled' : bc.status === tabFilter
    )

    // キーワード検索
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (bc) => bc.title.toLowerCase().includes(q) || bc.body.toLowerCase().includes(q)
      )
    }

    // 日時フィルタ
    if (filterDateFrom) {
      const from = new Date(filterDateFrom)
      result = result.filter((bc) => {
        const d = bc.sentAt ?? bc.scheduledAt ?? bc.createdAt
        return d >= from
      })
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo + 'T23:59:59')
      result = result.filter((bc) => {
        const d = bc.sentAt ?? bc.scheduledAt ?? bc.createdAt
        return d <= to
      })
    }

    // セグメントフィルタ
    if (filterSegment === 'class' && filterClassId) {
      result = result.filter(
        (bc) => bc.targetType === 'class' && bc.targetClassIds.includes(filterClassId)
      )
    }

    // 未読者フィルタ
    if (filterUnreadOnly) {
      result = result.filter((bc) => {
        if (bc.status !== 'sent') return false
        const reads = readStatuses.filter((r) => r.broadcastId === bc.id).length
        const total = getTargetMemberCount(bc)
        return reads < total
      })
    }

    return result
  }, [broadcasts, tabFilter, searchQuery, filterDateFrom, filterDateTo, filterSegment, filterClassId, filterUnreadOnly])

  const selected = broadcasts.find((bc) => bc.id === selectedId) ?? null

  const handleCreate = (data: Omit<Broadcast, 'id' | 'createdAt' | 'createdBy'>) => {
    if (editingDraft) {
      updateBroadcast(editingDraft.id, { ...data, sentAt: data.sentAt ?? editingDraft.sentAt })
      setEditingDraft(null)
    } else {
      const newBc: Broadcast = { ...data, id: String(Date.now()), createdBy: 'admin-001', createdAt: new Date() }
      addBroadcast(newBc)
      setSelectedId(newBc.id)
    }
    setShowCompose(false)
    if (data.status === 'scheduled') setTabFilter('scheduled')
  }

  const handleSaveDraft = (data: Omit<Broadcast, 'id' | 'createdAt' | 'createdBy'>) => {
    if (editingDraft) {
      updateBroadcast(editingDraft.id, data)
    } else {
      const newBc: Broadcast = { ...data, id: String(Date.now()), createdBy: 'admin-001', createdAt: new Date() }
      addBroadcast(newBc)
      setSelectedId(newBc.id)
    }
    setEditingDraft(null)
    setShowCompose(false)
    setTabFilter('draft')
  }

  const handleRecall = (id: string) => {
    updateBroadcast(id, { status: 'recalled' as const, recalledAt: new Date() })
    setRecallConfirmId(null)
  }

  const handleDeleteDraft = (id: string) => {
    updateBroadcast(id, { status: 'deleted' as Broadcast['status'] })
    if (selectedId === id) setSelectedId(null)
  }

  const handleEditDraft = (bc: Broadcast) => {
    setEditingDraft(bc)
    setShowCompose(true)
  }

  const hasActiveFilters = filterDateFrom || filterDateTo || (filterSegment === 'class' && filterClassId) || filterUnreadOnly

  return (
    <div className="flex h-screen">
      {/* Left: Slack-style List */}
      <div className="flex w-[420px] shrink-0 flex-col border-r border-border bg-bg-card">
        <div className="border-b border-border px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-text">配信管理</h2>
            <button onClick={() => setShowCompose(true)}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white">
              <Plus size={14} /> 新規作成
            </button>
          </div>

          {/* 検索バー */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="キーワード検索..."
              className="w-full rounded-lg border border-border bg-bg py-1.5 pl-8 pr-8 text-xs text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none" />
            <button onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 ${hasActiveFilters ? 'text-primary' : 'text-text-secondary hover:text-text'}`}>
              <Filter size={14} />
            </button>
          </div>

          {/* 詳細フィルタ */}
          {showFilters && (
            <div className="space-y-2 rounded-lg border border-border bg-bg p-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-0.5 block text-[10px] font-bold text-text-secondary">FROM</label>
                  <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="w-full rounded border border-border bg-bg-card px-2 py-1 text-[11px] text-text focus:border-primary focus:outline-none" />
                </div>
                <div className="flex-1">
                  <label className="mb-0.5 block text-[10px] font-bold text-text-secondary">TO</label>
                  <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)}
                    className="w-full rounded border border-border bg-bg-card px-2 py-1 text-[11px] text-text focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] font-bold text-text-secondary">配信対象</label>
                <div className="flex gap-1">
                  <button onClick={() => { setFilterSegment('all'); setFilterClassId('') }}
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${filterSegment === 'all' ? 'bg-primary text-white' : 'bg-bg-card text-text-secondary'}`}>
                    すべて
                  </button>
                  <button onClick={() => setFilterSegment('class')}
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${filterSegment === 'class' ? 'bg-primary text-white' : 'bg-bg-card text-text-secondary'}`}>
                    教室指定
                  </button>
                </div>
                {filterSegment === 'class' && (
                  <select value={filterClassId} onChange={(e) => setFilterClassId(e.target.value)}
                    className="mt-1 w-full rounded border border-border bg-bg-card px-2 py-1 text-[11px] text-text focus:border-primary focus:outline-none">
                    <option value="">教室を選択...</option>
                    {classOptions.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                )}
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={filterUnreadOnly} onChange={(e) => setFilterUnreadOnly(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary" />
                <span className="text-[11px] text-text">未読者ありのみ表示</span>
              </label>
              {hasActiveFilters && (
                <button onClick={() => { setFilterDateFrom(''); setFilterDateTo(''); setFilterSegment('all'); setFilterClassId(''); setFilterUnreadOnly(false) }}
                  className="text-[11px] text-primary hover:underline">
                  フィルタをクリア
                </button>
              )}
            </div>
          )}

          {/* タブ */}
          <div className="flex gap-1">
            {(['sent', 'scheduled', 'draft'] as const).map((tab) => (
              <button key={tab} onClick={() => setTabFilter(tab)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${tabFilter === tab ? 'bg-primary text-white' : 'bg-bg text-text-secondary hover:bg-border'}`}>
                {tab === 'sent' ? '配信済み' : tab === 'scheduled' ? '予約中' : '下書き'}
              </button>
            ))}
          </div>
        </div>

        {/* Slack風リスト */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-text-secondary">配信がありません</p>
          ) : (
            filtered.map((bc) => {
              const reads = readStatuses.filter((r) => r.broadcastId === bc.id).length
              const total = getTargetMemberCount(bc)
              const rate = total > 0 ? Math.round((reads / total) * 100) : 0
              const isActive = selectedId === bc.id

              return (
                <button key={bc.id} onClick={() => setSelectedId(bc.id)}
                  className={`w-full border-b border-border/50 px-4 py-3 text-left transition-colors ${isActive ? 'bg-primary/5' : 'hover:bg-bg'}`}>
                  {/* セグメントラベル */}
                  <div className="mb-1.5 flex items-center gap-2">
                    <SegmentLabels broadcast={bc} variant="compact" />
                    <span className="ml-auto shrink-0 text-[10px] text-text-secondary">
                      {formatShortDate(bc.sentAt ?? bc.scheduledAt ?? bc.createdAt)}
                    </span>
                  </div>
                  {/* タイトル */}
                  <div className="mb-1 flex items-center gap-1.5">
                    {bc.isImportant && bc.status !== 'recalled' && <AlertTriangle size={12} className="shrink-0 text-accent" />}
                    {bc.status === 'recalled' && <Undo2 size={12} className="shrink-0 text-text-secondary" />}
                    <span className={`flex-1 truncate text-sm font-semibold ${bc.status === 'recalled' ? 'text-text-secondary line-through' : 'text-text'}`}>
                      {bc.title}
                    </span>
                  </div>
                  {/* プレビュー本文 */}
                  <p className="mb-1.5 truncate text-xs text-text-secondary">{bc.body}</p>
                  {/* 既読率 (配信済みのみ) */}
                  {bc.status === 'sent' && (
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${rate}%` }} />
                      </div>
                      <span className={`text-[10px] font-bold ${rate === 100 ? 'text-success' : rate >= 50 ? 'text-primary' : 'text-danger'}`}>
                        {rate}%
                      </span>
                    </div>
                  )}
                  {bc.status === 'recalled' && (
                    <span className="text-[10px] font-medium text-text-secondary">取消済み</span>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right: SNS card-style feed */}
      <div className="flex-1 overflow-y-auto bg-bg">
        {filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-text-secondary">配信がありません</p>
          </div>
        ) : (
          <div>
            {filtered.map((bc) => {
              const reads = readStatuses.filter((r) => r.broadcastId === bc.id).length
              const total = getTargetMemberCount(bc)
              const rate = total > 0 ? Math.round((reads / total) * 100) : 0
              const isExpanded = selectedId === bc.id

              // セグメントラベル
              const segmentLabels: string[] = []
              if (bc.targetType === 'all') {
                segmentLabels.push('全体')
              } else if (bc.targetType === 'class') {
                bc.targetClassIds.forEach((id) => {
                  const name = classrooms.find((c) => c.id === id)?.name ?? id
                  segmentLabels.push(name)
                })
              } else if (bc.targetType === 'individual') {
                const names = (bc.targetUserIds ?? []).map(uid => members.find(m => m.uid === uid)?.name ?? uid)
                if (names.length <= 2) {
                  segmentLabels.push(...names)
                } else {
                  segmentLabels.push(names[0], `他${names.length - 1}名`)
                }
              }

              // 取消済み
              if (bc.status === 'recalled') {
                return (
                  <div
                    key={bc.id}
                    ref={(el) => { cardRefs.current[bc.id] = el }}
                    className="border-b border-border bg-bg-card opacity-50"
                    onClick={() => setSelectedId(isExpanded ? null : bc.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg text-xs font-bold text-text-secondary">
                          管
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-bold text-text-secondary">管理者</span>
                        </div>
                        <span className="shrink-0 text-[11px] text-text-secondary">
                          {formatShortDate(bc.sentAt ?? bc.createdAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm italic text-text-secondary">この配信は取り消されました</p>
                      <p className="mt-1 text-sm text-text-secondary line-through">{bc.title}</p>
                      {isExpanded && bc.recalledAt && (
                        <p className="mt-2 text-[10px] text-text-secondary">取消日時: {formatDate(bc.recalledAt)}</p>
                      )}
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={bc.id}
                  ref={(el) => { cardRefs.current[bc.id] = el }}
                  className={`border-b border-border bg-bg-card transition-colors duration-500 ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}
                  onClick={() => setSelectedId(isExpanded ? null : bc.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="px-5 py-4">
                    {/* Header: avatar + name + datetime */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        管
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-bold text-text">管理者</span>
                      </div>
                      <span className="shrink-0 text-[11px] text-text-secondary">
                        {formatShortDate(bc.sentAt ?? bc.scheduledAt ?? bc.createdAt)}
                      </span>
                    </div>

                    {/* Segment labels + important + status badges */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {segmentLabels.map((label) => (
                        <span
                          key={label}
                          className="inline-flex items-center gap-0.5 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary"
                        >
                          <Hash size={10} />{label}
                        </span>
                      ))}
                      {bc.isImportant && (
                        <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent">
                          <AlertTriangle size={11} /> 重要
                        </span>
                      )}
                      {bc.status === 'scheduled' && (
                        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                          <Clock size={11} /> 予約
                        </span>
                      )}
                      {bc.status === 'draft' && (
                        <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-bold text-text-secondary">
                          下書き
                        </span>
                      )}
                      {bc.status === 'sent' && (
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
                          配信済み
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="mt-2.5 text-sm font-bold leading-snug text-text">
                      {bc.title}
                    </h3>

                    {/* Body */}
                    <div className="mt-1.5">
                      <p className={`whitespace-pre-wrap text-[13px] leading-relaxed text-text-secondary ${isExpanded ? '' : 'line-clamp-6'}`}>
                        {bc.body}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedId(isExpanded ? null : bc.id) }}
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

                    {/* Read rate bar (sent only) */}
                    {bc.status === 'sent' && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${rate}%` }} />
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedId(bc.id); setShowReadDetail(true) }}
                          className={`shrink-0 text-[11px] font-bold hover:underline ${rate === 100 ? 'text-success' : rate >= 50 ? 'text-primary' : 'text-danger'}`}
                        >
                          既読 {rate}% ({reads}/{total})
                        </button>
                      </div>
                    )}

                    {/* Action buttons (expanded) */}
                    {isExpanded && (
                      <div className="mt-3 flex items-center gap-2">
                        {bc.status === 'sent' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowReadDetail(true) }}
                              className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-text-secondary hover:bg-bg"
                            >
                              <Eye size={12} /> 既読詳細
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setRecallConfirmId(bc.id) }}
                              className="flex items-center gap-1 rounded-lg border border-danger/30 px-3 py-1.5 text-[11px] font-medium text-danger hover:bg-danger/5"
                            >
                              <Undo2 size={12} /> 取り消し
                            </button>
                          </>
                        )}
                        {bc.status === 'draft' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditDraft(bc) }}
                              className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-text-secondary hover:bg-bg"
                            >
                              <Pencil size={12} /> 編集
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteDraft(bc.id) }}
                              className="flex items-center gap-1 rounded-lg border border-danger/30 px-3 py-1.5 text-[11px] font-medium text-danger hover:bg-danger/5"
                            >
                              <Trash2 size={12} /> 削除
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recall confirmation */}
      {recallConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-bg-card p-6 shadow-xl">
            <h3 className="mb-2 text-base font-bold text-text">配信を取り消し</h3>
            <p className="mb-4 text-sm text-text-secondary">
              この配信を取り消しますか？会員側には「この配信は取り消されました」と表示されます。
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setRecallConfirmId(null)}
                className="rounded-lg px-4 py-2 text-sm text-text-secondary hover:bg-bg">キャンセル</button>
              <button onClick={() => handleRecall(recallConfirmId)}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white">取り消す</button>
            </div>
          </div>
        </div>
      )}

      {/* Read detail modal */}
      {showReadDetail && selected && selected.status === 'sent' && (
        <ReadDetailModal broadcast={selected} onClose={() => setShowReadDetail(false)} />
      )}

      {showCompose && (
        <ComposePanel
          onClose={() => { setShowCompose(false); setEditingDraft(null) }}
          onSend={handleCreate}
          onSaveDraft={handleSaveDraft}
          editingDraft={editingDraft}
        />
      )}
    </div>
  )
}
