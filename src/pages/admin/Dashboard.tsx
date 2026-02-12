import { Users, MessageSquare, Megaphone, CalendarOff } from 'lucide-react'
import {
  DUMMY_ABSENCES,
  DUMMY_BROADCASTS,
  DUMMY_READ_STATUSES,
  DUMMY_MEMBERS,
  DUMMY_MESSAGES,
  getTargetLabel,
  getTargetMemberCount,
  getClassLabel,
} from '../../lib/dummyData'

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-text-secondary">{label}</span>
      </div>
      <p className="text-2xl font-bold text-text">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-text-secondary">{sub}</p>}
    </div>
  )
}

export function AdminDashboard() {
  const todayAbsences = DUMMY_ABSENCES.filter(
    (a) => a.date.toDateString() === new Date().toDateString()
  )
  const unreadMessages = DUMMY_MESSAGES.filter((m) => m.senderRole === 'member').length
  const sentBroadcasts = DUMMY_BROADCASTS.filter((b) => b.status === 'sent')

  // 直近配信の開封率
  const latestBroadcast = sentBroadcasts[0]
  const latestReads = latestBroadcast
    ? DUMMY_READ_STATUSES.filter((r) => r.broadcastId === latestBroadcast.id).length
    : 0
  const latestTotal = latestBroadcast ? getTargetMemberCount(latestBroadcast) : 0
  const latestRate = latestTotal > 0 ? Math.round((latestReads / latestTotal) * 100) : 0

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-bold text-text">ダッシュボード</h1>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        <StatCard
          icon={<CalendarOff size={18} className="text-white" />}
          label="本日の欠席者"
          value={todayAbsences.length}
          sub={`全${DUMMY_MEMBERS.length}名中`}
          color="bg-danger"
        />
        <StatCard
          icon={<MessageSquare size={18} className="text-white" />}
          label="未対応メッセージ"
          value={unreadMessages}
          sub="会員からの受信"
          color="bg-primary"
        />
        <StatCard
          icon={<Megaphone size={18} className="text-white" />}
          label="直近配信の開封率"
          value={`${latestRate}%`}
          sub={`${latestReads}/${latestTotal}名開封`}
          color="bg-accent"
        />
        <StatCard
          icon={<Users size={18} className="text-white" />}
          label="登録会員数"
          value={DUMMY_MEMBERS.length}
          sub="アクティブ"
          color="bg-success"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 本日の欠席者 */}
        <div className="rounded-xl border border-border bg-bg-card p-5">
          <h2 className="mb-4 text-sm font-bold text-text">本日の欠席者</h2>
          {todayAbsences.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-secondary">欠席者はいません</p>
          ) : (
            <div className="space-y-2">
              {todayAbsences.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-danger/10 text-xs font-bold text-danger">
                      {a.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text">{a.userName}</p>
                      <p className="text-[11px] text-text-secondary">{getClassLabel(a.classId)}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-medium text-danger">
                    {a.reason}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 直近の配信 */}
        <div className="rounded-xl border border-border bg-bg-card p-5">
          <h2 className="mb-4 text-sm font-bold text-text">直近の配信</h2>
          <div className="space-y-3">
            {sentBroadcasts.slice(0, 4).map((bc) => {
              const reads = DUMMY_READ_STATUSES.filter((r) => r.broadcastId === bc.id).length
              const total = getTargetMemberCount(bc)
              const rate = total > 0 ? Math.round((reads / total) * 100) : 0

              return (
                <div key={bc.id} className="rounded-lg bg-bg px-3 py-2.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="flex-1 truncate text-sm font-medium text-text">{bc.title}</p>
                    <span className="ml-2 shrink-0 text-xs text-text-secondary">
                      {getTargetLabel(bc)}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-text-secondary">
                      {rate}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
