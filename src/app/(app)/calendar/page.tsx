'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { TaskData } from '@/types'

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toLocalDateKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<TaskData[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => {
        if (data.tasks) setTasks(data.tasks)
      })
      .catch(() => setTasks([]))
  }, [])

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const startDay = new Date(monthStart)
  startDay.setDate(1 - monthStart.getDay())

  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    const day = new Date(startDay)
    day.setDate(startDay.getDate() + i)
    days.push(day)
  }

  const tasksByDate = new Map<string, TaskData[]>()
  tasks.forEach((task) => {
    if (!task.date) return
    const d = new Date(task.date)
    const key = toLocalDateKey(d)
    const existing = tasksByDate.get(key) || []
    existing.push(task)
    tasksByDate.set(key, existing)
  })

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Calendar View <CalendarIcon className="w-5 h-5 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">Monthly task overview and scheduled activity.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg border border-slate-700 bg-slate-950/50 text-slate-300 hover:text-white"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <h2 className="text-lg font-bold text-white">
            {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentMonth)}
          </h2>

          <button
            onClick={nextMonth}
            className="p-2 rounded-lg border border-slate-700 bg-slate-950/50 text-slate-300 hover:text-white"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-wider text-slate-400 mb-2">
          {weekdayLabels.map((label) => (
            <div key={label} className="py-2">{label}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const iso = toLocalDateKey(day)
            const dayTasks = tasksByDate.get(iso) || []
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
            const isToday = iso === toLocalDateKey(new Date())

            return (
              <div
                key={iso}
                className={[
                  'min-h-[120px] rounded-xl border p-2',
                  isCurrentMonth ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-950/30 border-slate-800/70 text-slate-500',
                  isToday ? 'ring-1 ring-indigo-500/70' : '',
                ].join(' ')}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={['text-xs font-semibold', isToday ? 'text-indigo-300' : 'text-slate-300'].join(' ')}>
                    {day.getDate()}
                  </span>
                </div>

                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="rounded-md px-1.5 py-1 text-[10px] font-medium text-white truncate"
                      style={{ backgroundColor: task.category?.color || '#6366f1' }}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] text-slate-400">+{dayTasks.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
