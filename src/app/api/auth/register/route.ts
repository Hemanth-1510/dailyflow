import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input fields' }, { status: 400 })
    }

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        categories: {
          createMany: {
            data: [
              { name: 'Work', color: '#6366f1', icon: 'briefcase', description: 'Work related tasks' },
              { name: 'Personal', color: '#ec4899', icon: 'user', description: 'Personal errands' },
              { name: 'Health', color: '#10b981', icon: 'heart', description: 'Workouts & health' },
              { name: 'Learning', color: '#f59e0b', icon: 'book', description: 'Study & skill development' },
            ],
          },
        },
      },
      select: { id: true, name: true, email: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('[Register]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
