import { useState } from 'react'
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
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCalendarEvents } from '../../hooks/useData'
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

export function MemberCalendarPage() {
  const { events } = useCalendarEvents()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="sticky top-0 z-40 flex h-12 items-center border-b border-border bg-bg-card px-4">
        <h1 className="text-base font-bold text-text">カレンダー</h1>
      </header>

      {/* Month navigation */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-bg"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-base font-bold">
          {format(currentMonth, 'yyyy年M月', { locale: ja })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-bg"
        >
          <ChevronRight size={20} />
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

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const events = getEventsForDate(d)
          const inMonth = isSameMonth(d, currentMonth)
          const today = isToday(d)
          const selected = selectedDate && isSameDay(d, selectedDate)
          const dayOfWeek = d.getDay()

          return (
            <button
              key={d.toISOString()}
              onClick={() => setSelectedDate(d)}
              className={`flex min-h-[48px] flex-col items-center gap-0.5 border-b border-r border-border/50 py-1 transition-colors ${
                selected ? 'bg-primary/10' : 'hover:bg-bg'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
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
              {events.length > 0 && (
                <div className="flex gap-0.5">
                  {events.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={`h-1.5 w-1.5 rounded-full ${EVENT_COLORS[e.type]}`}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected date events */}
      {selectedDate && (
        <div className="flex-1 overflow-y-auto border-t border-border bg-bg p-4 pb-20">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-text">
              {format(selectedDate, 'M月d日（E）', { locale: ja })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-border"
            >
              <X size={16} />
            </button>
          </div>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-text-secondary">予定はありません</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((event) => (
                <div key={event.id} className="rounded-xl bg-bg-card p-3 shadow-sm">
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${EVENT_COLORS[event.type]}`}>
                      {EVENT_LABELS[event.type]}
                    </span>
                    <span className="font-semibold text-text">{event.title}</span>
                  </div>
                  {event.description && (
                    <p className="whitespace-pre-wrap text-xs leading-relaxed text-text-secondary">
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
