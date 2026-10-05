import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const activeSession = await prisma.timeSession.findFirst({
    where: { userId: session.user.id, isActive: true },
    include: {
      task: { select: { id: true, title: true, category: true } },
      category: true,
    },
  })

  return NextResponse.json({ activeSession: activeSession || null })
}
