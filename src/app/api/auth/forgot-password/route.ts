import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { z } from 'zod'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key')
const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const { email } = parsed.data
    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600 * 1000) // 1 hour

    await prisma.passwordReset.create({
      data: { userId: user.id, token, expires },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@dailyflow.app',
      to: email,
      subject: 'Reset your DailyFlow password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366f1;">Reset your password</h1>
          <p>Hi ${user.name || 'there'},</p>
          <p>You requested a password reset for your DailyFlow account.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">Reset Password</a>
          <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ForgotPassword]', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
