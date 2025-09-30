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
        session.user.id = token.id as string
        session.user.role = token.role as any
        session.user.costCenter = token.costCenter as string
        session.user.department = token.department as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
        token.costCenter = (user as any).costCenter
        token.department = (user as any).department
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
  secret: process.env.NEXTAUTH_SECRET
}

