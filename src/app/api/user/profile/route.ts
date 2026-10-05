import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      timezone: true,
      theme: true,
      timeFormat: true,
      firstDayOfWeek: true,
      defaultTaskDuration: true,
      onboardingDone: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ user })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.timezone !== undefined && { timezone: body.timezone }),
      ...(body.theme !== undefined && { theme: body.theme }),
      ...(body.timeFormat !== undefined && { timeFormat: body.timeFormat }),
      ...(body.firstDayOfWeek !== undefined && { firstDayOfWeek: body.firstDayOfWeek }),
      ...(body.defaultTaskDuration !== undefined && { defaultTaskDuration: body.defaultTaskDuration }),
      ...(body.onboardingDone !== undefined && { onboardingDone: body.onboardingDone }),
    },
  })

  return NextResponse.json({ user: updated })
}
