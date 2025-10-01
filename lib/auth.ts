import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'
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
          console.log(`🔐 Authentication attempt for: ${email}`)

          // Create Supabase client
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          
          if (!supabaseUrl || !supabaseKey) {
            console.error('[auth] Missing Supabase configuration')
            return null
          }

          const supabase = createClient(supabaseUrl, supabaseKey)

          // Find user
          const { data: user, error } = await supabase
            .from('User')
            .select('*')
            .eq('email', email)
            .single()

          if (error || !user) {
            console.warn('[auth][authorize] User not found', { email, error: error?.message })
            return null
          }

          console.log(`✅ User authenticated: ${user.name} (${user.role})`)

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
          return null
        }
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
        token.id = user.id
        token.role = user.role
        token.costCenter = user.costCenter
        token.department = user.department
      }
      return token
    }
  },
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  },
  secret: env.NEXTAUTH_SECRET
}
