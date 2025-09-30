import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const startedAt = new Date().toISOString()
  try {
    const userCount = await prisma.user.count()
    return NextResponse.json({
      ok: true,
      startedAt,
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
        NODE_ENV: process.env.NODE_ENV || null
      },
      db: { ok: true, userCount }
    })
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      startedAt,
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
        NODE_ENV: process.env.NODE_ENV || null
      },
      db: { ok: false, error: err?.message || String(err) }
    }, { status: 500 })
  }
}
