'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface LogEntry {
  timestamp: string
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  details?: any
  userId?: string
  sessionId?: string
}

export default function LogsPage() {
  const { data: session } = useSession()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (levelFilter !== 'all') {
        params.append('level', levelFilter)
      }
      params.append('limit', '100')

      const response = await fetch(`/api/logs?${params}`)
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Logs')
      }

      const data = await response.json()
      setLogs(data.logs || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [levelFilter])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh, levelFilter])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive'
      case 'warn': return 'secondary'
      case 'info': return 'default'
      case 'debug': return 'outline'
      default: return 'outline'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('de-DE')
  }

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-600">
              Zugriff verweigert. Nur für Administratoren.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📊 System Logs</h1>
        <p className="text-gray-600">Überwachung und Debugging der Anwendung</p>
      </div>

      <div className="mb-4 flex gap-4 items-center">
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter nach Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Levels</SelectItem>
            <SelectItem value="error">Nur Fehler</SelectItem>
            <SelectItem value="warn">Nur Warnungen</SelectItem>
            <SelectItem value="info">Nur Info</SelectItem>
            <SelectItem value="debug">Nur Debug</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          onClick={fetchLogs} 
          disabled={loading}
          variant="outline"
        >
          {loading ? 'Lädt...' : '🔄 Aktualisieren'}
        </Button>

        <Button 
          onClick={() => setAutoRefresh(!autoRefresh)}
          variant={autoRefresh ? "default" : "outline"}
        >
          {autoRefresh ? '⏸️ Auto-Refresh aus' : '▶️ Auto-Refresh an'}
        </Button>
      </div>

      {error && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">❌ {error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 Logs ({logs.length})
            {autoRefresh && <Badge variant="secondary">Live</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {loading ? 'Lädt Logs...' : 'Keine Logs gefunden'}
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getLevelColor(log.level)}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        {log.sessionId && (
                          <span className="text-xs text-gray-400">
                            Session: {log.sessionId.slice(-8)}
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-sm">{log.message}</p>
                      {log.details && (
                        <pre className="text-xs text-gray-600 mt-2 bg-white p-2 rounded border overflow-x-auto">
                          {typeof log.details === 'string' 
                            ? log.details 
                            : JSON.stringify(log.details, null, 2)
                          }
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
