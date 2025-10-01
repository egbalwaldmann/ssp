import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'E-Mail',
      credentials: {
        email: { label: "E-Mail", type: "email", placeholder: "user@bund.de" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email) {
            console.error('[auth][authorize] Missing email in credentials')
            return null
          }
          const email = String(credentials.email).toLowerCase().trim()
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user) {
            console.warn('[auth][authorize] User not found', { email })
            return null
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            costCenter: user.costCenter,
            department: user.department
          }
        } catch (err) {
          console.error('[auth][authorize] Unexpected error', err)
          throw err
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      try {
        if (token && session.user) {
          session.user.id = token.id as string
          session.user.role = token.role as any
          session.user.costCenter = token.costCenter as string
          session.user.department = token.department as string
        }
        return session
      } catch (err) {
        console.error('[auth][session] error', err)
        throw err as any
      }
    },
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = (user as any).id
          token.role = (user as any).role
          token.costCenter = (user as any).costCenter
          token.department = (user as any).department
        }
        return token
      } catch (err) {
        console.error('[auth][jwt] error', err)
        throw err as any
      }
    }
  },
  events: {
    signIn(message) {
      console.log('[auth][event] signIn', message)
    },
    signOut(message) {
      console.log('[auth][event] signOut', message)
    },
    session(message) {
      console.log('[auth][event] session', message)
    }
  },
  logger: {
    error(code, metadata) {
      console.error('[auth][logger][error]', code, metadata)
    },
    warn(code) {
      console.warn('[auth][logger][warn]', code)
    },
    debug(code, metadata) {
      console.debug('[auth][logger][debug]', code, metadata)
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt'
  },
  secret: env.NEXTAUTH_SECRET,
  debug: env.NEXTAUTH_DEBUG === 'true'
}

