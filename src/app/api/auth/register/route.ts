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

    const normalizedEmail = email.trim().toLowerCase()

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
      },
      select: { id: true, name: true, email: true },
    })

    try {
      await prisma.category.createMany({
        data: [
          { userId: user.id, name: 'Work', color: '#6366f1', icon: 'briefcase', description: 'Work related tasks' },
          { userId: user.id, name: 'Personal', color: '#ec4899', icon: 'user', description: 'Personal errands' },
          { userId: user.id, name: 'Health', color: '#10b981', icon: 'heart', description: 'Workouts & health' },
          { userId: user.id, name: 'Learning', color: '#f59e0b', icon: 'book', description: 'Study & skill development' },
        ],
      })
    } catch (categoryError) {
      console.warn('[Register] Category seed failed, continuing:', categoryError)
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('[Register]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
