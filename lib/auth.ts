import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@bund.de" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        // For MVP: Simple email-based auth (simulates Entra ID)
        // In production, this would verify against Azure AD
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            costCenter: user.costCenter,
            department: user.department
          }
        }

        return null
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.costCenter = token.costCenter
        session.user.department = token.department
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.costCenter = user.costCenter
        token.department = user.department
      }
      return token
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true
}

