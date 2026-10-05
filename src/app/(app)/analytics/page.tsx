'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'
import { BarChart3, TrendingUp, Clock, Target, CalendarRange } from 'lucide-react'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((res) => {
        setData(res.analytics)
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-slate-400">Loading analytics...</div>
  if (!data) return <div className="text-slate-400">No analytics available yet.</div>

  const monthSeries = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const iso = date.toISOString().slice(0, 10)
    const match = data.dailyTrend?.find((item: any) => item.date === iso)

    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completed: match?.completed ?? 0,
      focusMinutes: match?.focusMinutes ?? 0,
    }
  })

  const maxCategoryMinutes = data.categoryDistribution?.length
    ? Math.max(...data.categoryDistribution.map((d: any) => d.totalTimeMinutes || 0))
    : 1

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Productivity Analytics <BarChart3 className="w-5 h-5 text-indigo-400" />
        </h1>
        <p className="text-sm text-slate-400 mt-1">Insights into focus, completion, and time allocation across your month.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase"><TrendingUp className="w-4 h-4" /> Productivity</div>
          <div className="mt-3 text-3xl font-black text-white">{data.productivityScore ?? 0}%</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase"><Target className="w-4 h-4" /> Completed</div>
          <div className="mt-3 text-3xl font-black text-white">{data.completedTasksCount ?? 0}</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase"><Clock className="w-4 h-4" /> Focus</div>
          <div className="mt-3 text-3xl font-black text-white">{data.totalTimeSpentMinutes ?? 0}m</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Daily completion trend</h3>
            <CalendarRange className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} interval={6} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                />
                <Line type="monotone" dataKey="completed" stroke="#818cf8" strokeWidth={3} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-base font-bold text-white mb-4">Time by category</h3>
          <div className="h-72 flex items-center justify-center">
            {data.categoryDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    dataKey="totalTimeMinutes"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {data.categoryDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">No category tracking data yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-base font-bold text-white mb-4">Focus minutes by day</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthSeries}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} interval={6} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                <Bar dataKey="focusMinutes" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-base font-bold text-white mb-4">Category breakdown</h3>
          <div className="space-y-3">
            {data.categoryDistribution?.length ? (
              data.categoryDistribution.map((entry: any) => (
                <div key={entry.categoryId} className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      {entry.categoryName}
                    </div>
                    <span>{entry.totalTimeMinutes}m</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, ((entry.totalTimeMinutes || 0) / maxCategoryMinutes) * 100)}%`,
                        backgroundColor: entry.color,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
