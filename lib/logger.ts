interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  details?: any
  timestamp?: string
}

class Logger {
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async sendToServer(entry: LogEntry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...entry,
          sessionId: this.sessionId
        })
      })
    } catch (error) {
      // Silently fail to avoid infinite loops
      console.warn('Failed to send log to server:', error)
    }
  }

  private log(level: LogEntry['level'], message: string, details?: any) {
    const entry: LogEntry = {
      level,
      message,
      details,
      timestamp: new Date().toISOString()
    }

    // Log to console
    const consoleMethod = level === 'error' ? 'error' : 
                         level === 'warn' ? 'warn' : 
                         level === 'info' ? 'info' : 'log'
    
    console[consoleMethod](`[${level.toUpperCase()}] ${message}`, details || '')

    // Send to server
    this.sendToServer(entry)
  }

  error(message: string, details?: any) {
    this.log('error', message, details)
  }

  warn(message: string, details?: any) {
    this.log('warn', message, details)
  }

  info(message: string, details?: any) {
    this.log('info', message, details)
  }

  debug(message: string, details?: any) {
    this.log('debug', message, details)
  }

  // Capture unhandled errors
  captureError(error: Error, context?: string) {
    this.error(`Unhandled error${context ? ` in ${context}` : ''}`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
  }

  // Capture fetch errors
  captureFetchError(url: string, error: any, response?: Response) {
    this.error(`Fetch error for ${url}`, {
      error: error.message || error,
      status: response?.status,
      statusText: response?.statusText,
      url
    })
  }
}

// Create singleton instance
export const logger = new Logger()

// Set up global error handlers
if (typeof window !== 'undefined') {
  // Capture unhandled errors
  window.addEventListener('error', (event) => {
    logger.captureError(event.error, 'Global error handler')
  })

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      reason: event.reason,
      promise: event.promise
    })
  })

  // Override console methods to capture all logs
  const originalConsole = {
    error: console.error,
    warn: console.warn,
    info: console.info,
    log: console.log
  }

  console.error = (...args) => {
    originalConsole.error(...args)
    logger.error(args.join(' '))
  }

  console.warn = (...args) => {
    originalConsole.warn(...args)
    logger.warn(args.join(' '))
  }

  console.info = (...args) => {
    originalConsole.info(...args)
    logger.info(args.join(' '))
  }

  console.log = (...args) => {
    originalConsole.log(...args)
    logger.debug(args.join(' '))
  }
}
