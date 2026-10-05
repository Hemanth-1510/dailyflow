'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [theme, setTheme] = useState('dark')

  const handleComplete = async () => {
    await fetch('/api/user/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
    })
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-white">Welcome to DailyFlow!</h2>
        <p className="text-sm text-slate-400">
          Your personal command center for daily tasks, time tracking, and productivity analytics.
        </p>

        <button
          onClick={handleComplete}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25"
        >
          Get Started <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
