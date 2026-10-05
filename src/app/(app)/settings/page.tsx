'use client'

import { useState, useEffect } from 'react'
import { Settings, User, Moon, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [theme, setTheme] = useState('dark')
  const [timeFormat, setTimeFormat] = useState('12h')

  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name || '')
          setTheme(data.user.theme || 'dark')
          setTimeFormat(data.user.timeFormat || '12h')
        }
      })
  }, [])

  const handleSave = async () => {
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, theme, timeFormat }),
    })
    if (res.ok) {
      toast.success('Settings updated')
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          User Settings <Settings className="w-5 h-5 text-indigo-400" />
        </h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account preferences and app defaults.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Time Format
          </label>
          <select
            value={timeFormat}
            onChange={(e) => setTimeFormat(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="12h">12-hour (1:30 PM)</option>
            <option value="24h">24-hour (13:30)</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
