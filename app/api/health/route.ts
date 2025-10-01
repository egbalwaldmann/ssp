import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { env, logEnvStatus } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const startedAt = new Date().toISOString()
  
  // Log environment status for debugging
  logEnvStatus()
  
  try {
    const userCount = await prisma.user.count()
    return NextResponse.json({
      ok: true,
      startedAt,
      env: {
        NEXTAUTH_URL: env.NEXTAUTH_URL,
        NODE_ENV: process.env.NODE_ENV || null,
        DATABASE_URL: env.DATABASE_URL ? 'SET' : 'MISSING',
        NEXTAUTH_SECRET: env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
      },
      db: { ok: true, userCount }
    })
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      startedAt,
      env: {
        NEXTAUTH_URL: env.NEXTAUTH_URL,
        NODE_ENV: process.env.NODE_ENV || null,
        DATABASE_URL: env.DATABASE_URL ? 'SET' : 'MISSING',
        NEXTAUTH_SECRET: env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
      },
      db: { ok: false, error: err?.message || String(err) }
    }, { status: 500 })
  }
}
