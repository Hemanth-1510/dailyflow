'use client'

import { useState } from 'react'
import { TaskData } from '@/types'
import { CheckCircle2, Circle, Clock, Play, Pause, Square, Calendar, Tag, MoreVertical, Trash2, Edit3 } from 'lucide-react'
import { getPriorityColor, formatDuration } from '@/lib/utils'
import { useTimer } from '@/components/providers/TimerProvider'
import { formatElapsed } from '@/lib/timer'

interface TaskCardProps {
  task: TaskData
  onToggleComplete: (id: string) => void
  onStartTimer: (task: TaskData) => void
  onEdit: (task: TaskData) => void
  onDelete: (id: string) => void
}

export default function TaskCard({
  task,
  onToggleComplete,
  onStartTimer,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const isCompleted = task.status === 'COMPLETED'
  const [showMenu, setShowMenu] = useState(false)

  const timer = useTimer()
  const isActiveSessionForTask = timer.activeSession && timer.activeSession.taskId === task.id

  return (
    <div
      className={`group relative rounded-xl p-4 border transition-all duration-200 ${
        isCompleted
          ? 'bg-slate-900/40 border-slate-800/60 text-slate-400'
          : 'bg-slate-900/90 hover:bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-100 shadow-md hover:shadow-lg'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(task.id)}
          className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors focus:outline-none"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4
              onClick={() => onEdit(task)}
              className={`text-sm font-semibold truncate cursor-pointer hover:text-indigo-400 transition-colors ${
                isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
              }`}
            >
              {task.title}
            </h4>

            {task.category && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border"
                style={{
                  backgroundColor: `${task.category.color}15`,
                  borderColor: `${task.category.color}30`,
                  color: task.category.color,
                }}
              >
                {task.category.name}
              </span>
            )}

            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-2">{task.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap mt-2">
            {task.estimatedDuration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {task.actualDuration || 0}m / {formatDuration(task.estimatedDuration)}
                </span>
              </div>
            )}

            {task.date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isCompleted && (
            isActiveSessionForTask ? (
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-md bg-slate-800 text-xs font-medium text-white">
                  {formatElapsed(timer.elapsed)}
                </div>
                {timer.activeSession?.pausedAt ? (
                  <button
                    onClick={() => timer.resumeTimer()}
                    title="Resume"
                    className="p-2 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-400 hover:text-white transition-all duration-200"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => timer.pauseTimer()}
                    title="Pause"
                    className="p-2 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-400 hover:text-white transition-all duration-200"
                  >
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => timer.stopTimer()}
                  title="Stop"
                  className="p-2 rounded-lg bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 text-rose-400 hover:text-white transition-all duration-200"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onStartTimer(task)}
                title="Start Timer"
                className="p-2 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-600 text-indigo-400 hover:text-white transition-all duration-200"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            )
          )}

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                onMouseLeave={() => setShowMenu(false)}
                className="absolute right-0 mt-1 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-20 py-1"
              >
                <button
                  onClick={() => {
                    setShowMenu(false)
                    onEdit(task)
                  }}
                  className="w-full px-3 py-1.5 text-xs text-left text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Task
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    onDelete(task.id)
                  }}
                  className="w-full px-3 py-1.5 text-xs text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
