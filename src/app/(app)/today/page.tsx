'use client'

import { useState, useEffect } from 'react'
import TaskCard from '@/components/tasks/TaskCard'
import TaskModal from '@/components/tasks/TaskModal'
import { TaskData, CategoryData } from '@/types'
import { Sun, Sunset, Moon, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function TodayPage() {
  const [tasks, setTasks] = useState<TaskData[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchData = async () => {
    const dateStr = new Date().toISOString().split('T')[0]
    const [tasksRes, catRes] = await Promise.all([
      fetch(`/api/tasks?date=${dateStr}`),
      fetch('/api/categories'),
    ])
    const tasksData = await tasksRes.json()
    const catData = await catRes.json()
    if (tasksData.tasks) setTasks(tasksData.tasks)
    if (catData.categories) setCategories(catData.categories)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleToggleComplete = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}/complete`, { method: 'POST' })
    if (res.ok) fetchData()
  }

  const handleStartTimer = async (task: TaskData) => {
    const res = await fetch('/api/timer/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id }),
    })
    if (res.ok) {
      toast.success(`Timer started for "${task.title}"`)
      window.dispatchEvent(new Event('timer-updated'))
    }
  }

  const handleSaveTask = async (taskData: Partial<TaskData>) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...taskData, date: new Date().toISOString().split('T')[0] }),
    })
    if (res.ok) {
      toast.success('Task added for today')
      fetchData()
    }
  }

  const handleDeleteTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (res.ok) fetchData()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Today's Schedule <Sun className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">Focus on your immediate tasks for today.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleComplete={handleToggleComplete}
            onStartTimer={handleStartTimer}
            onEdit={() => {}}
            onDelete={handleDeleteTask}
          />
        ))}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        categories={categories}
      />
    </div>
  )
}
