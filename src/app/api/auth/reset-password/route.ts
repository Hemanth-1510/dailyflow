import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  token: z.string(),
  password: z.string().min(8).max(100),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { token, password } = parsed.data

    const reset = await prisma.passwordReset.findUnique({ where: { token } })
    if (!reset || reset.used || reset.expires < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
      prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true } }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ResetPassword]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
