import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DailyFlow — Daily Task, Time Tracking & Productivity Analytics',
  description: 'Manage tasks, track actual vs estimated time, analyze productivity, and master your day.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200`}>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster position="top-right" theme="dark" richColors />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
