import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { env, logEnvStatus } from '@/lib/env'
import { robustAuth } from '@/lib/auth-robust'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const startedAt = new Date().toISOString()
  
  // Log environment status for debugging
  logEnvStatus()
  
  try {
    // Test database connection with retry logic
    const dbHealthy = await robustAuth.checkDatabaseHealth()
    
    if (!dbHealthy) {
      return NextResponse.json({
        ok: false,
        startedAt,
        env: {
          NEXTAUTH_URL: env.NEXTAUTH_URL,
          NODE_ENV: process.env.NODE_ENV || null,
          DATABASE_URL: env.DATABASE_URL ? 'SET' : 'MISSING',
          NEXTAUTH_SECRET: env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
        },
        db: { 
          ok: false, 
          error: 'Database connection failed - using fallback authentication',
          fallbackAvailable: true
        },
        auth: {
          ok: true,
          fallbackMode: true,
          message: 'Authentication available via fallback users'
        }
      }, { status: 503 })
    }

    // Database is healthy, get user count
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
      db: { 
        ok: true, 
        userCount,
        connection: 'healthy'
      },
      auth: {
        ok: true,
        fallbackMode: false,
        message: 'Full authentication available'
      }
    })
  } catch (err: any) {
    console.error('Health check failed:', err)
    
    return NextResponse.json({
      ok: false,
      startedAt,
      env: {
        NEXTAUTH_URL: env.NEXTAUTH_URL,
        NODE_ENV: process.env.NODE_ENV || null,
        DATABASE_URL: env.DATABASE_URL ? 'SET' : 'MISSING',
        NEXTAUTH_SECRET: env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
      },
      db: { 
        ok: false, 
        error: err?.message || String(err),
        fallbackAvailable: true
      },
      auth: {
        ok: true,
        fallbackMode: true,
        message: 'Authentication available via fallback users'
      }
    }, { status: 503 })
  }
}
