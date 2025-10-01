import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// In-memory log storage (in production, use a proper logging service)
const logs: Array<{
  timestamp: string
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  details?: any
  userId?: string
  sessionId?: string
}> = []

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Only allow admins to view logs
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const level = searchParams.get('level') as 'error' | 'warn' | 'info' | 'debug' | null

    let filteredLogs = logs

    if (level) {
      filteredLogs = logs.filter(log => log.level === level)
    }

    // Return most recent logs
    const recentLogs = filteredLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    return NextResponse.json({
      logs: recentLogs,
      total: logs.length,
      filtered: filteredLogs.length
    })
  } catch (error) {
    console.error('❌ Error fetching logs:', error)
    return NextResponse.json({ error: 'Fehler beim Laden der Logs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { level, message, details, sessionId } = body

    if (!level || !message) {
      return NextResponse.json({ error: 'Level und Message sind erforderlich' }, { status: 400 })
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level as 'error' | 'warn' | 'info' | 'debug',
      message,
      details,
      sessionId
    }

    logs.push(logEntry)

    // Keep only last 1000 logs to prevent memory issues
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000)
    }

    console.log(`📝 Client log [${level.toUpperCase()}]:`, message, details ? details : '')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error saving log:', error)
    return NextResponse.json({ error: 'Fehler beim Speichern des Logs' }, { status: 500 })
  }
}
