import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})

const googleEnabled = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || 'dev-nextauth-secret-change-me',
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    ...(googleEnabled ? [Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })] : []),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        })

        if (!user || !user.passwordHash) return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }

      if (trigger === 'update' && session) {
        token.name = session.name ?? token.name
        token.picture = session.image ?? token.picture
      }

      return token
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string
      }

      if (token?.email && session.user) {
        session.user.email = token.email as string
      }

      if (token?.name && session.user) {
        session.user.name = token.name as string
      }

      return session
    },
  },
})
