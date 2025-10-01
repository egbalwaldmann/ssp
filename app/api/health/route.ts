import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const startedAt = new Date().toISOString()
  
  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        ok: false,
        startedAt,
        error: 'Missing Supabase environment variables',
        env: {
          NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? 'SET' : 'MISSING',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey ? 'SET' : 'MISSING',
          DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
        }
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test database connection with a simple query
    const { data, error } = await supabase
      .from('User')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Database connection error:', error)
      return NextResponse.json({
        ok: false,
        startedAt,
        env: {
          NEXT_PUBLIC_SUPABASE_URL: 'SET',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: 'SET',
          DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
        },
        db: { 
          ok: false, 
          error: error.message,
          details: error.details
        }
      }, { status: 503 })
    }

    // Get user count
    const { count: userCount, error: countError } = await supabase
      .from('User')
      .select('*', { count: 'exact', head: true })
    
    return NextResponse.json({
      ok: true,
      startedAt,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: 'SET',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'SET',
        DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
      },
      db: { 
        ok: true, 
        userCount: userCount || 0,
        connection: 'healthy',
        provider: 'supabase'
      }
    })
  } catch (err: any) {
    console.error('Health check failed:', err)
    
    return NextResponse.json({
      ok: false,
      startedAt,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
        DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
      },
      db: { 
        ok: false, 
        error: err?.message || String(err)
      }
    }, { status: 503 })
  }
}