'use client'

import { useState, useEffect } from 'react'
import { CategoryData } from '@/types'
import { Folder, Plus, Trash2, Edit3, Clock, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')

  const fetchCategories = async () => {
    const res = await fetch('/api/categories')
    const data = await res.json()
    if (data.categories) setCategories(data.categories)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    })

    if (res.ok) {
      toast.success('Category created')
      setName('')
      fetchCategories()
    } else {
      toast.error('Failed to create category')
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Category deleted')
      fetchCategories()
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Categories <Folder className="w-5 h-5 text-indigo-400" />
        </h1>
        <p className="text-sm text-slate-400 mt-1">Organize your workflow into color-coded areas.</p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <input
          type="text"
          placeholder="New category name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 rounded-xl cursor-pointer bg-slate-950 border border-slate-800 p-1"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div
            key={c.id}
            className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between shadow-md"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full shadow-sm"
                style={{ backgroundColor: c.color }}
              />
              <div>
                <h4 className="text-base font-bold text-white">{c.name}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>{c.taskCount || 0} tasks</span>
                  <span>•</span>
                  <span>{c.totalTimeMinutes || 0} mins</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDelete(c.id)}
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
