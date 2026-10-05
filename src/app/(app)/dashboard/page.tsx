'use client'

import { useState, useEffect } from 'react'
import ProductivityScore from '@/components/dashboard/ProductivityScore'
import StatCards from '@/components/dashboard/StatCards'
import TaskCard from '@/components/tasks/TaskCard'
import TaskModal from '@/components/tasks/TaskModal'
import { TaskData, CategoryData } from '@/types'
import { Plus, CheckCircle2, Clock, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function DashboardPage() {
  const [tasks, setTasks] = useState<TaskData[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskData | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const [tasksRes, catRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/categories'),
      ])
      const tasksData = await tasksRes.json()
      const catData = await catRes.json()

      if (tasksData.tasks) setTasks(tasksData.tasks)
      if (catData.categories) setCategories(catData.categories)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setDisplayName(d.user.name || null)
      })
      .catch(() => {})
  }, [])

  const handleToggleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}/complete`, { method: 'POST' })
      if (res.ok) {
        toast.success('Task updated')
        fetchData()
      }
    } catch {
      toast.error('Failed to update task')
    }
  }

  const handleStartTimer = async (task: TaskData) => {
    try {
      const res = await fetch('/api/timer/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, categoryId: task.categoryId }),
      })
      if (res.ok) {
        toast.success(`Timer started for "${task.title}"`)
        window.dispatchEvent(new Event('timer-updated'))
      }
    } catch {
      toast.error('Failed to start timer')
    }
  }

  const handleSaveTask = async (taskData: Partial<TaskData>) => {
    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks'
      const method = editingTask ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })

      if (res.ok) {
        toast.success(editingTask ? 'Task updated' : 'Task created')
        setEditingTask(null)
        fetchData()
      }
    } catch {
      toast.error('Failed to save task')
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Task deleted')
        fetchData()
      }
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const completedToday = tasks.filter((t) => t.status === 'COMPLETED').length
  const totalToday = tasks.length
  const totalTimeSpent = tasks.reduce((acc, t) => acc + (t.actualDuration || 0), 0)
  const totalEstimated = tasks.reduce((acc, t) => acc + (t.estimatedDuration || 0), 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            {displayName ? `Hi, ${displayName}` : 'Dashboard'} <Sparkles className="w-5 h-5 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your tasks, focus sessions, and productivity output.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      <ProductivityScore
        score={totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 100}
        completedTasks={completedToday}
        totalTasks={totalToday}
        streakDays={5}
      />

      <StatCards
        completedToday={completedToday}
        totalToday={totalToday}
        timeSpentMinutes={totalTimeSpent}
        estimatedMinutes={totalEstimated}
      />

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Today's Focus Tasks</h2>
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No tasks for today</h3>
            <p className="text-xs text-slate-500 mt-1">Create your first task to begin tracking time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onStartTimer={handleStartTimer}
                onEdit={(t) => {
                  setEditingTask(t)
                  setIsModalOpen(true)
                }}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        categories={categories}
        initialTask={editingTask}
      />
    </div>
  )
}
