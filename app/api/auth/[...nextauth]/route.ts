import NextAuth from 'next-auth'
import { robustAuthOptions } from '@/lib/auth-robust'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const handler = NextAuth(robustAuthOptions)

export { handler as GET, handler as POST }

