import { useState } from 'react'
import {
  Plus,
  X,
  Send,
  Clock,
  Eye,
  EyeOff,
  ImagePlus,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react'
import {
  DUMMY_BROADCASTS,
  DUMMY_READ_STATUSES,
  DUMMY_MEMBERS,
  CLASS_OPTIONS,
  getTargetLabel,
  getTargetMemberCount,
} from '../../lib/dummyData'
import type { Broadcast } from '../../types'

function formatDate(date: Date): string {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

// --- 配信分析パネル ---
function AnalyticsPanel({ broadcast }: { broadcast: Broadcast }) {
  const [showUnread, setShowUnread] = useState(false)
  const reads = DUMMY_READ_STATUSES.filter((r) => r.broadcastId === broadcast.id)
  const targetMembers =
    broadcast.targetType === 'all'
      ? DUMMY_MEMBERS
      : DUMMY_MEMBERS.filter((m) => broadcast.targetClassIds.includes(m.classId))
  const total = targetMembers.length
  const readCount = reads.length
  const unreadMembers = targetMembers.filter(
    (m) => !reads.some((r) => r.userId === m.uid)
  )
  const rate = total > 0 ? Math.round((readCount / total) * 100) : 0

  return (
    <div className="rounded-xl border border-border bg-bg p-4">
      {/* Rate bar */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold text-text">開封率</span>
        <span className="text-2xl font-bold text-primary">{rate}%</span>
      </div>
      <div className="mb-4 h-3 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${rate}%` }}
        />
      </div>
      <div className="mb-4 flex gap-4">
        <div className="flex items-center gap-1.5">
          <Eye size={14} className="text-primary" />
          <span className="text-sm text-text">
            開封: <b>{readCount}</b>名
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <EyeOff size={14} className="text-text-secondary" />
          <span className="text-sm text-text">
            未読: <b>{unreadMembers.length}</b>名
          </span>
        </div>
      </div>

      {/* Unread list toggle */}
      <button
        onClick={() => setShowUnread(!showUnread)}
        className="flex w-full items-center justify-between rounded-lg bg-bg-card px-3 py-2 text-sm text-text-secondary hover:bg-border/50"
      >
        <span>未読者リスト</span>
        {showUnread ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {showUnread && (
        <div className="mt-2 space-y-1">
          {unreadMembers.map((m) => (
            <div
              key={m.uid}
              className="flex items-center justify-between rounded-lg bg-bg-card px-3 py-2"
            >
              <span className="text-sm text-text">{m.name}</span>
              <button className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/20">
                <RotateCcw size={10} />
                再通知
              </button>
            </div>
          ))}
          {unreadMembers.length === 0 && (
            <p className="py-2 text-center text-xs text-text-secondary">全員開封済み</p>
          )}
        </div>
      )}

      {/* Read timeline */}
      {reads.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-bold text-text-secondary">開封ログ</p>
          <div className="max-h-32 space-y-1 overflow-y-auto">
            {reads
              .sort((a, b) => b.openedAt.getTime() - a.openedAt.getTime())
              .map((r) => (
                <div
                  key={`${r.broadcastId}-${r.userId}`}
                  className="flex items-center justify-between px-2 py-1 text-xs"
                >
                  <span className="text-text">{r.userName}</span>
                  <span className="text-text-secondary">{formatDate(r.openedAt)}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

// --- 配信作成モーダル ---
function ComposePanel({ onClose, onSend }: {
  onClose: () => void
  onSend: (bc: Omit<Broadcast, 'id' | 'createdAt' | 'createdBy'>) => void
}) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [targetType, setTargetType] = useState<'all' | 'class'>('all')
  const [targetClassIds, setTargetClassIds] = useState<string[]>([])
  const [isImportant, setIsImportant] = useState(false)
  const [scheduleMode, setScheduleMode] = useState<'now' | 'scheduled'>('now')
  const [scheduledAt, setScheduledAt] = useState('')

  const toggleClass = (id: string) => {
    setTargetClassIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const handleSend = () => {
    if (!title.trim() || !body.trim()) return
    onSend({
      title: title.trim(),
      body: body.trim(),
      targetType,
      targetClassIds: targetType === 'all' ? [] : targetClassIds,
      isImportant,
      status: scheduleMode === 'now' ? 'sent' : 'scheduled',
      sentAt: scheduleMode === 'now' ? new Date() : undefined,
      scheduledAt: scheduleMode === 'scheduled' && scheduledAt ? new Date(scheduledAt) : undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-2xl bg-bg-card shadow-xl" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-bold text-text">新規配信作成</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-bg">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-5" style={{ maxHeight: 'calc(90vh - 130px)' }}>
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-secondary">タイトル</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="配信タイトルを入力"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Target */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-secondary">配信対象</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTargetType('all')}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium ${
                  targetType === 'all' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-secondary'
                }`}
              >
                全体
              </button>
              <button
                onClick={() => setTargetType('class')}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium ${
                  targetType === 'class' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-secondary'
                }`}
              >
                クラス指定
              </button>
            </div>
            {targetType === 'class' && (
              <div className="mt-2 flex gap-2">
                {CLASS_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => toggleClass(c.value)}
                    className={`rounded-full border-2 px-3 py-1.5 text-xs font-medium ${
                      targetClassIds.includes(c.value)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-text-secondary'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Body */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-secondary">本文</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="配信内容を入力..."
              rows={6}
              className="w-full resize-none rounded-lg border border-border bg-bg p-3 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Image */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-secondary">画像（任意）</label>
            <button className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-text-secondary hover:border-primary hover:text-primary">
              <ImagePlus size={18} />
              画像を選択
            </button>
          </div>

          <div className="flex gap-6">
            {/* Important */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsImportant(!isImportant)}
                className={`relative h-6 w-10 rounded-full transition-colors ${isImportant ? 'bg-accent' : 'bg-border'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isImportant ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
              <span className="flex items-center gap-1 text-sm text-text">
                <AlertTriangle size={14} className="text-accent" /> 重要
              </span>
            </div>

            {/* Schedule */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setScheduleMode(scheduleMode === 'now' ? 'scheduled' : 'now')}
                className={`relative h-6 w-10 rounded-full transition-colors ${scheduleMode === 'scheduled' ? 'bg-primary' : 'bg-border'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${scheduleMode === 'scheduled' ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
              <span className="flex items-center gap-1 text-sm text-text">
                <Clock size={14} /> 予約配信
              </span>
            </div>
          </div>

          {scheduleMode === 'scheduled' && (
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none"
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg"
          >
            キャンセル
          </button>
          <button
            onClick={handleSend}
            disabled={!title.trim() || !body.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white transition-opacity disabled:opacity-40"
          >
            <Send size={14} />
            {scheduleMode === 'now' ? '今すぐ配信' : '予約する'}
          </button>
        </div>
      </div>
    </div>
  )
}

// --- メイン ---
export function AdminBroadcastManager() {
  const [broadcasts, setBroadcasts] = useState(DUMMY_BROADCASTS)
  const [selectedId, setSelectedId] = useState<string | null>(broadcasts[0]?.id ?? null)
  const [showCompose, setShowCompose] = useState(false)
  const [tabFilter, setTabFilter] = useState<'sent' | 'scheduled' | 'draft'>('sent')

  const filtered = broadcasts.filter((bc) => bc.status === tabFilter)
  const selected = broadcasts.find((bc) => bc.id === selectedId) ?? null

  const handleCreate = (data: Omit<Broadcast, 'id' | 'createdAt' | 'createdBy'>) => {
    const newBc: Broadcast = {
      ...data,
      id: String(Date.now()),
      createdBy: 'admin-001',
      createdAt: new Date(),
    }
    setBroadcasts((prev) => [newBc, ...prev])
    setSelectedId(newBc.id)
    setShowCompose(false)
    if (data.status === 'scheduled') setTabFilter('scheduled')
  }

  return (
    <div className="flex h-screen">
      {/* Left: List */}
      <div className="flex w-96 shrink-0 flex-col border-r border-border bg-bg-card">
        <div className="border-b border-border px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-text">配信管理</h2>
            <button
              onClick={() => setShowCompose(true)}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white"
            >
              <Plus size={14} />
              新規作成
            </button>
          </div>
          <div className="flex gap-1">
            {(['sent', 'scheduled', 'draft'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setTabFilter(tab)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  tabFilter === tab
                    ? 'bg-primary text-white'
                    : 'bg-bg text-text-secondary hover:bg-border'
                }`}
              >
                {tab === 'sent' ? '配信済み' : tab === 'scheduled' ? '予約中' : '下書き'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-text-secondary">配信がありません</p>
          ) : (
            filtered.map((bc) => {
              const reads = DUMMY_READ_STATUSES.filter((r) => r.broadcastId === bc.id).length
              const total = getTargetMemberCount(bc)
              const rate = total > 0 ? Math.round((reads / total) * 100) : 0
              const isActive = selectedId === bc.id

              return (
                <button
                  key={bc.id}
                  onClick={() => setSelectedId(bc.id)}
                  className={`w-full border-b border-border/50 px-4 py-3 text-left transition-colors ${
                    isActive ? 'bg-primary/5' : 'hover:bg-bg'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    {bc.isImportant && <AlertTriangle size={12} className="text-accent" />}
                    <span className="flex-1 truncate text-sm font-semibold text-text">
                      {bc.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-text-secondary">
                      {getTargetLabel(bc)} ・ {formatDate(bc.sentAt ?? bc.scheduledAt ?? bc.createdAt)}
                    </span>
                    {bc.status === 'sent' && (
                      <span className="text-[11px] font-medium text-primary">{rate}%</span>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right: Detail + Analytics */}
      <div className="flex-1 overflow-y-auto p-6">
        {selected ? (
          <div className="mx-auto max-w-2xl space-y-6">
            <div>
              <div className="mb-1 flex items-center gap-2">
                {selected.isImportant && (
                  <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent">
                    <AlertTriangle size={12} /> 重要
                  </span>
                )}
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  selected.status === 'sent'
                    ? 'bg-success/10 text-success'
                    : selected.status === 'scheduled'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-bg text-text-secondary'
                }`}>
                  {selected.status === 'sent' ? '配信済み' : selected.status === 'scheduled' ? '予約中' : '下書き'}
                </span>
              </div>
              <h1 className="text-xl font-bold text-text">{selected.title}</h1>
              <p className="mt-1 text-xs text-text-secondary">
                対象: {getTargetLabel(selected)} ・ {formatDate(selected.sentAt ?? selected.scheduledAt ?? selected.createdAt)}
              </p>
            </div>

            {selected.imageUrl && (
              <img src={selected.imageUrl} alt="" className="w-full rounded-xl" />
            )}

            <div className="rounded-xl border border-border bg-bg-card p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">
                {selected.body}
              </p>
            </div>

            {selected.status === 'sent' && <AnalyticsPanel broadcast={selected} />}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-text-secondary">配信を選択してください</p>
          </div>
        )}
      </div>

      {showCompose && (
        <ComposePanel
          onClose={() => setShowCompose(false)}
          onSend={handleCreate}
        />
      )}
    </div>
  )
}
