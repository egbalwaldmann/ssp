// Environment variable loader with fallbacks
export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://weilesgeht.de',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'X2m5mE8P3xR7Q1uK9nV4sT6bC0zL5yA8',
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || 'true',
  NEXTAUTH_DEBUG: process.env.NEXTAUTH_DEBUG || 'true',
  NEXTAUTH_CSRF_CHECK_ORIGIN: process.env.NEXTAUTH_CSRF_CHECK_ORIGIN || 'false',
  NEXTAUTH_URL_INTERNAL: process.env.NEXTAUTH_URL_INTERNAL || 'https://weilesgeht.de',
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cybsvbhhsepzfoakbqsz.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5YnN2Ymhoc2VwemZvYWticXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjQzNDYsImV4cCI6MjA3NDg0MDM0Nn0.izE3NIBXDhx30OBknlk_4Ol3ZPLyuXhTzk0c4zrYP-I',
}

// Validate required environment variables
export function validateEnv() {
  const required = ['DATABASE_URL', 'NEXTAUTH_SECRET']
  const missing = required.filter(key => !env[key as keyof typeof env])
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing)
    return false
  }
  
  return true
}

// Log environment status for debugging
export function logEnvStatus() {
  console.log('Environment variables status:')
  console.log('DATABASE_URL:', env.DATABASE_URL ? 'SET' : 'MISSING')
  console.log('NEXTAUTH_URL:', env.NEXTAUTH_URL)
  console.log('NEXTAUTH_SECRET:', env.NEXTAUTH_SECRET ? 'SET' : 'MISSING')
  console.log('AUTH_TRUST_HOST:', env.AUTH_TRUST_HOST)
  console.log('NEXTAUTH_DEBUG:', env.NEXTAUTH_DEBUG)
  console.log('NEXTAUTH_CSRF_CHECK_ORIGIN:', env.NEXTAUTH_CSRF_CHECK_ORIGIN)
  console.log('NEXTAUTH_URL_INTERNAL:', env.NEXTAUTH_URL_INTERNAL)
  console.log('NEXT_PUBLIC_SUPABASE_URL:', env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING')
}
