'use client'

import { useState, useEffect } from 'react'
import TaskCard from '@/components/tasks/TaskCard'
import TaskModal from '@/components/tasks/TaskModal'
import { TaskData, CategoryData } from '@/types'
import { Plus, Search, Filter, Layers } from 'lucide-react'
import { toast } from 'sonner'

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskData[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskData | null>(null)

  const fetchData = async () => {
    try {
      const query = new URLSearchParams()
      if (search) query.set('search', search)
      if (selectedCategory) query.set('categoryId', selectedCategory)
      if (selectedPriority) query.set('priority', selectedPriority)

      const [tasksRes, catRes] = await Promise.all([
        fetch(`/api/tasks?${query.toString()}`),
        fetch('/api/categories'),
      ])

      const tasksData = await tasksRes.json()
      const catData = await catRes.json()

      if (tasksData.tasks) setTasks(tasksData.tasks)
      if (catData.categories) setCategories(catData.categories)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [search, selectedCategory, selectedPriority])

  const handleToggleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}/complete`, { method: 'POST' })
      if (res.ok) fetchData()
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
  }

  const handleDeleteTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Task deleted')
      fetchData()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Tasks <Layers className="w-5 h-5 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage and filter your task backlog.</p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

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
