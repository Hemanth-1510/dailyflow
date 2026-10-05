'use client'

import { FileText, Download } from 'lucide-react'
import { toast } from 'sonner'

export default function ReportsPage() {
  const handleExportCSV = async () => {
    toast.success('Exporting tasks CSV report...')
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Productivity Reports <FileText className="w-5 h-5 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">Export weekly and monthly productivity summaries.</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV Report
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-slate-300">
        <h3 className="text-lg font-bold text-white mb-2">Weekly Summary</h3>
        <p className="text-xs text-slate-400">
          Generated automatically from your recorded tasks and time-tracking sessions.
        </p>
      </div>
    </div>
  )
}
