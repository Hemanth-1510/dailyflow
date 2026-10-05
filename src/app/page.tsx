import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock, BarChart3, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl">DailyFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2">
            Open dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm">
            <Zap className="w-3.5 h-3.5" />
            Productivity, reimagined
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
            Your daily flow,{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              perfected
            </span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
            DailyFlow combines intelligent task management, accurate time tracking, and beautiful
            analytics to help you understand and improve your productivity.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-indigo-600/25"
            >
              Open dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
          {[
            {
              icon: CheckCircle2,
              title: 'Smart Task Management',
              desc: 'Create, organize, and track tasks with priorities, categories, and deadlines.',
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
            },
            {
              icon: Clock,
              title: 'Accurate Time Tracking',
              desc: 'Timestamp-based timers that survive page refreshes, tab switches, and computer sleep.',
              color: 'text-indigo-400',
              bg: 'bg-indigo-500/10',
            },
            {
              icon: BarChart3,
              title: 'Deep Analytics',
              desc: 'Visualize your productivity patterns with beautiful charts and heatmaps.',
              color: 'text-purple-400',
              bg: 'bg-purple-500/10',
            },
            {
              icon: Zap,
              title: 'Productivity Score',
              desc: 'A transparent, formula-based score that shows exactly where you excel and where to improve.',
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-600 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
