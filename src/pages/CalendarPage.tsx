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
import { Header } from '../components/Header'
import type { CalendarEvent } from '../types'

const DUMMY_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: '通常練習',
    date: new Date('2026-02-10T17:00:00'),
    description: '第1グラウンド 17:00〜19:00',
    classId: 'all',
    type: 'practice',
  },
  {
    id: '2',
    title: '祝日 - 練習休み',
    date: new Date('2026-02-11T00:00:00'),
    classId: 'all',
    type: 'holiday',
  },
  {
    id: '3',
    title: '振替練習',
    date: new Date('2026-02-14T10:00:00'),
    description: '体育館 10:00〜12:00',
    classId: 'all',
    type: 'practice',
  },
  {
    id: '4',
    title: '練習試合 vs チームB',
    date: new Date('2026-02-22T09:00:00'),
    description: '市営グラウンド 9:00〜15:00\n集合: 8:30\n持ち物: ユニフォーム、弁当、水筒',
    classId: 'class-a',
    type: 'game',
  },
  {
    id: '5',
    title: '3月大会',
    date: new Date('2026-03-15T08:00:00'),
    description: '県営総合運動公園\n8:00集合\n詳細は後日連絡',
    classId: 'all',
    type: 'game',
  },
]

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

export function CalendarPage() {
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
    DUMMY_EVENTS.filter((e) => isSameDay(e.date, date))

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <div className="flex h-full flex-col">
      <Header title="カレンダー" />

      {/* Month navigation */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
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
            className={`py-2 text-center text-xs font-medium ${
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
              className={`flex min-h-[52px] flex-col items-center gap-0.5 border-b border-r border-border/50 py-1.5 transition-colors ${
                selected ? 'bg-primary/10' : 'hover:bg-bg'
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
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
        <div className="flex-1 border-t border-border bg-bg p-4">
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
                <div
                  key={event.id}
                  className="rounded-xl bg-bg-card p-3 shadow-sm"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${EVENT_COLORS[event.type]}`}
                    >
                      {EVENT_LABELS[event.type]}
                    </span>
                    <span className="font-semibold text-text">
                      {event.title}
                    </span>
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
