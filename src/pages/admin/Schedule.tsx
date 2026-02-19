import { useState, useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CalendarOff, Users } from 'lucide-react'
import { useCalendarEvents, useAbsences, useMembers, useClassLabel } from '../../hooks/useData'
import type { CalendarEvent } from '../../types'

const EVENT_COLORS: Record<CalendarEvent['type'], string> = {
  practice: 'bg-primary',
  game: 'bg-accent',
  event: 'bg-success',
  holiday: 'bg-danger',
}

const EVENT_LABELS: Record<CalendarEvent['type'], string> = {
  practice: '練習',
  game: '試合',
  event: 'イベント',
  holiday: '休日',
}

export function AdminSchedule() {
  const { events } = useCalendarEvents()
  const { absences } = useAbsences()
  const { members } = useMembers()
  const getClassLabel = useClassLabel()

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days: Date[] = []
  let day = calendarStart
  while (day <= calendarEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  const getEventsForDate = (date: Date) =>
    events.filter((e) => isSameDay(e.date, date))

  const getAbsencesForDate = (date: Date) =>
    absences.filter((a) => isSameDay(a.date, date))

  const selectedEvents = getEventsForDate(selectedDate)
  const selectedAbsences = getAbsencesForDate(selectedDate)

  const presentMembers = useMemo(() => {
    const absentIds = new Set(selectedAbsences.map((a) => a.userId))
    return members.filter((m) => !absentIds.has(m.uid))
  }, [selectedAbsences, members])

  return (
    <div className="flex h-screen">
      {/* Left: Calendar */}
      <div className="flex w-[420px] shrink-0 flex-col border-r border-border bg-bg-card">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-bold text-text">スケジュール / 出欠管理</h2>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-bg"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-bold">{format(currentMonth, 'yyyy年M月', { locale: ja })}</span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-bg"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Week header */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((wd, i) => (
            <div
              key={wd}
              className={`py-1.5 text-center text-xs font-medium ${
                i === 0 ? 'text-danger' : i === 6 ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7">
          {days.map((d) => {
            const events = getEventsForDate(d)
            const absences = getAbsencesForDate(d)
            const inMonth = isSameMonth(d, currentMonth)
            const today = isToday(d)
            const selected = isSameDay(d, selectedDate)
            const dayOfWeek = d.getDay()

            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelectedDate(d)}
                className={`flex min-h-[56px] flex-col items-center gap-0.5 border-b border-r border-border/50 py-1 transition-colors ${
                  selected ? 'bg-primary/10' : 'hover:bg-bg'
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    today
                      ? 'bg-primary font-bold text-white'
                      : !inMonth
                        ? 'text-text-secondary/40'
                        : dayOfWeek === 0
                          ? 'text-danger'
                          : dayOfWeek === 6
                            ? 'text-primary'
                            : 'text-text'
                  }`}
                >
                  {format(d, 'd')}
                </span>
                <div className="flex gap-0.5">
                  {events.slice(0, 2).map((e) => (
                    <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${EVENT_COLORS[e.type]}`} />
                  ))}
                </div>
                {absences.length > 0 && (
                  <span className="text-[9px] font-bold text-danger">欠{absences.length}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: Day detail */}
      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="mb-4 text-lg font-bold text-text">
          {format(selectedDate, 'M月d日（E）', { locale: ja })}
        </h2>

        {/* Events */}
        {selectedEvents.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-bold text-text-secondary">予定</h3>
            <div className="space-y-2">
              {selectedEvents.map((ev) => (
                <div key={ev.id} className="rounded-xl border border-border bg-bg-card p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${EVENT_COLORS[ev.type]}`}>
                      {EVENT_LABELS[ev.type]}
                    </span>
                    <span className="font-semibold text-text">{ev.title}</span>
                  </div>
                  {ev.description && (
                    <p className="whitespace-pre-wrap text-sm text-text-secondary">{ev.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Absences */}
        <div className="mb-6">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-danger">
            <CalendarOff size={15} />
            欠席者（{selectedAbsences.length}名）
          </h3>
          {selectedAbsences.length === 0 ? (
            <p className="rounded-xl bg-bg px-4 py-6 text-center text-sm text-text-secondary">
              欠席者はいません
            </p>
          ) : (
            <div className="space-y-1.5">
              {selectedAbsences.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-danger/10 text-xs font-bold text-danger">
                      {a.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text">{a.userName}</p>
                      <p className="text-[11px] text-text-secondary">{getClassLabel(a.classId)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-medium text-danger">
                      {a.reason}
                    </span>
                    {a.note && <p className="mt-0.5 text-[11px] text-text-secondary">{a.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Present members */}
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-success">
            <Users size={15} />
            出席予定（{presentMembers.length}名）
          </h3>
          <div className="flex flex-wrap gap-2">
            {presentMembers.map((m) => (
              <div key={m.uid} className="flex items-center gap-1.5 rounded-full bg-bg px-3 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-[10px] font-bold text-success">
                  {m.name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-text">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
