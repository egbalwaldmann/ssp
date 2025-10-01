import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { env, validateEnv, logEnvStatus } from '@/lib/env'

// Robust authentication with retry logic and fallbacks
class RobustAuth {
  private static instance: RobustAuth
  private retryCount = 0
  private maxRetries = 3
  private retryDelay = 1000 // 1 second

  static getInstance(): RobustAuth {
    if (!RobustAuth.instance) {
      RobustAuth.instance = new RobustAuth()
    }
    return RobustAuth.instance
  }

  // Validate environment on startup
  initialize(): boolean {
    console.log('🔐 Initializing Robust Authentication System...')
    logEnvStatus()
    
    if (!validateEnv()) {
      console.error('❌ Environment validation failed')
      return false
    }
    
    console.log('✅ Environment validation passed')
    return true
  }

  // Retry logic with exponential backoff
  private async retry<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 ${operationName} - Attempt ${attempt}/${this.maxRetries}`)
        const result = await operation()
        this.retryCount = 0 // Reset on success
        return result
      } catch (error) {
        console.error(`❌ ${operationName} - Attempt ${attempt} failed:`, error)
        
        if (attempt === this.maxRetries) {
          console.error(`💥 ${operationName} - All attempts failed`)
          throw error
        }
        
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt - 1)
        console.log(`⏳ Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    throw new Error(`${operationName} failed after ${this.maxRetries} attempts`)
  }

  // Robust user lookup with fallback
  async findUser(email: string) {
    return this.retry(async () => {
      // Validate email format
      if (!this.isValidEmail(email)) {
        throw new Error('INVALID_EMAIL_FORMAT')
      }

      const normalizedEmail = email.toLowerCase().trim()
      console.log(`🔍 Looking up user: ${normalizedEmail}`)
      
      const user = await prisma.user.findUnique({ 
        where: { email: normalizedEmail },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          costCenter: true,
          department: true
        }
      })

      if (!user) {
        console.warn(`⚠️ User not found: ${normalizedEmail}`)
        throw new Error('USER_NOT_FOUND')
      }

      console.log(`✅ User found: ${user.name} (${user.role})`)
      return user
    }, 'User Lookup')
  }

  // Email validation
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Database health check
  async checkDatabaseHealth(): Promise<boolean> {
    try {
      await this.retry(async () => {
        await prisma.$queryRaw`SELECT 1`
      }, 'Database Health Check')
      return true
    } catch (error) {
      console.error('💥 Database health check failed:', error)
      return false
    }
  }

  // Get demo users as fallback
  getDemoUsers() {
    return [
      {
        id: 'demo-user-1',
        email: 'user@bund.de',
        name: 'Testbenutzer',
        role: 'REQUESTER',
        costCenter: 'CC-001',
        department: 'Marketing'
      },
      {
        id: 'demo-user-2',
        email: 'it@bund.de',
        name: 'IT-Support',
        role: 'IT_AGENT',
        costCenter: 'IT-001',
        department: 'IT'
      },
      {
        id: 'demo-user-3',
        email: 'reception@bund.de',
        name: 'Empfangssupport',
        role: 'RECEPTION_AGENT',
        costCenter: 'RCP-001',
        department: 'Empfang'
      },
      {
        id: 'demo-user-4',
        email: 'manager@bund.de',
        name: 'Abteilungsleiter',
        role: 'APPROVER',
        costCenter: 'CC-001',
        department: 'Marketing'
      },
      {
        id: 'demo-user-5',
        email: 'admin@bund.de',
        name: 'Systemadministrator',
        role: 'ADMIN',
        costCenter: 'ADM-001',
        department: 'IT'
      }
    ]
  }

  // Fallback authentication when database is unavailable
  async authenticateWithFallback(email: string) {
    const normalizedEmail = email.toLowerCase().trim()
    const demoUsers = this.getDemoUsers()
    
    const user = demoUsers.find(u => u.email === normalizedEmail)
    if (user) {
      console.log(`🔄 Using fallback authentication for: ${user.name}`)
      return user
    }
    
    throw new Error('USER_NOT_FOUND')
  }
}

// Initialize robust auth
const robustAuth = RobustAuth.getInstance()
robustAuth.initialize()

// Enhanced NextAuth configuration
export const robustAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'E-Mail',
      credentials: {
        email: { 
          label: "E-Mail", 
          type: "email", 
          placeholder: "user@bund.de" 
        }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email) {
            console.error('[auth][authorize] Missing email in credentials')
            return null
          }

          const email = String(credentials.email).toLowerCase().trim()
          console.log(`🔐 Authentication attempt for: ${email}`)

          // Check database health first
          const dbHealthy = await robustAuth.checkDatabaseHealth()
          
          let user
          if (dbHealthy) {
            try {
              user = await robustAuth.findUser(email)
            } catch (error) {
              console.warn('Database lookup failed, trying fallback:', error)
              user = await robustAuth.authenticateWithFallback(email)
            }
          } else {
            console.warn('Database unhealthy, using fallback authentication')
            user = await robustAuth.authenticateWithFallback(email)
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as any,
            costCenter: user.costCenter,
            department: user.department
          }
        } catch (err) {
          console.error('[auth][authorize] Authentication failed:', err)
          
          // Return specific error types for better user feedback
          if (err instanceof Error) {
            if (err.message === 'INVALID_EMAIL_FORMAT') {
              throw new Error('UNGÜLTIGE_E_MAIL_FORMAT')
            } else if (err.message === 'USER_NOT_FOUND') {
              throw new Error('BENUTZER_NICHT_GEFUNDEN')
            }
          }
          
          throw new Error('AUTHENTIFIZIERUNG_FEHLGESCHLAGEN')
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      try {
        if (token && session.user) {
          session.user.id = token.id as string
          session.user.role = token.role as any
          session.user.costCenter = token.costCenter as string
          session.user.department = token.department as string
        }
        return session
      } catch (err) {
        console.error('[auth][session] error', err)
        throw err as any
      }
    },
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = (user as any).id
          token.role = (user as any).role
          token.costCenter = (user as any).costCenter
          token.department = (user as any).department
        }
        return token
      } catch (err) {
        console.error('[auth][jwt] error', err)
        throw err as any
      }
    }
  },
  events: {
    signIn(message) {
      console.log('✅ [auth][event] signIn successful:', message.user?.email)
    },
    signOut(message) {
      console.log('👋 [auth][event] signOut:', message.session?.user?.email)
    },
    session(message) {
      console.log('🔄 [auth][event] session updated:', message.session?.user?.email)
    }
  },
  logger: {
    error(code, metadata) {
      console.error('❌ [auth][logger][error]', code, metadata)
    },
    warn(code) {
      console.warn('⚠️ [auth][logger][warn]', code)
    },
    debug(code, metadata) {
      console.debug('🔍 [auth][logger][debug]', code, metadata)
    }
  },
  pages: {
    signIn: '/login',
    error: '/login?error=1'
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60 // 1 hour
  },
  secret: env.NEXTAUTH_SECRET,
  debug: env.NEXTAUTH_DEBUG === 'true'
}

export { robustAuth }
