import { CalendarOff, Check } from 'lucide-react'
import type { Message } from '../types'

interface AbsenceCardProps {
  message: Message
}

export function AbsenceCard({ message }: AbsenceCardProps) {
  const dateStr = message.absenceDate ?? ''
  const parts = dateStr.split('-')
  const displayDate = parts.length === 3 ? `${Number(parts[1])}月${Number(parts[2])}日` : dateStr

  return (
    <div className="mx-4 my-2">
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
        <div className="border-l-4 border-l-danger p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-danger/10">
              <CalendarOff size={16} className="text-danger" />
            </div>
            <span className="text-sm font-bold text-text">お休み連絡</span>
          </div>
          <div className="mb-2 text-lg font-bold text-text">{displayDate}</div>
          <div className="mb-2 flex flex-wrap gap-2">
            {message.absenceReason && (
              <span className="rounded-full bg-danger/10 px-3 py-1 text-xs font-medium text-danger">
                {message.absenceReason}
              </span>
            )}
          </div>
          {message.absenceNote && (
            <p className="mb-2 text-sm text-text-secondary">{message.absenceNote}</p>
          )}
          <div className="flex items-center gap-1 text-success">
            <Check size={14} />
            <span className="text-xs font-medium">受付済み</span>
          </div>
        </div>
      </div>
    </div>
  )
}
