'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { ShoppingCart, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

// Enhanced error handling with specific messages
const getErrorMessage = (error: string): string => {
  switch (error) {
    case 'UNGÜLTIGE_E_MAIL_FORMAT':
      return 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
    case 'BENUTZER_NICHT_GEFUNDEN':
      return 'Diese E-Mail-Adresse ist nicht registriert. Bitte verwenden Sie eine der Demo-Accounts.'
    case 'AUTHENTIFIZIERUNG_FEHLGESCHLAGEN':
      return 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'
    case 'CredentialsSignin':
      return 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre E-Mail-Adresse.'
    default:
      return 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
  }
}

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastError, setLastError] = useState<string | null>(null)

  // Handle URL error parameters
  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage)
      setLastError(errorMessage)
    }
  }, [searchParams])

  // Auto-login after hard reload initiated by quick login
  useEffect(() => {
    const autoEmail = typeof window !== 'undefined' ? sessionStorage.getItem('autoLoginEmail') : null
    const shouldReloadLogin = searchParams.get('reload')
    if (autoEmail && shouldReloadLogin && !isLoading) {
      const run = async () => {
        setIsLoading(true)
        setLastError(null)
        try {
          console.log(`🔁 Auto login after hard reload for: ${autoEmail}`)
          const result = await signIn('credentials', {
            email: autoEmail,
            redirect: false
          })

          if (result?.ok) {
            toast.success('Anmeldung erfolgreich!')
            sessionStorage.removeItem('autoLoginEmail')
            router.push('/catalog')
            router.refresh()
          } else {
            const msg = result?.error ? getErrorMessage(result.error) : 'Schnell-Anmeldung fehlgeschlagen'
            toast.error(msg)
            setLastError(msg)
            sessionStorage.removeItem('autoLoginEmail')
          }
        } catch (e) {
          console.error('Auto login exception:', e)
          const msg = 'Netzwerkfehler bei der Schnell-Anmeldung'
          toast.error(msg)
          setLastError(msg)
          sessionStorage.removeItem('autoLoginEmail')
        } finally {
          setIsLoading(false)
        }
      }
      run()
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setLastError(null)
    
    if (!email.trim()) {
      const errorMsg = 'Bitte E-Mail eingeben'
      toast.error(errorMsg)
      setLastError(errorMsg)
      return
    }

    if (!isValidEmail(email)) {
      const errorMsg = 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
      toast.error(errorMsg)
      setLastError(errorMsg)
      return
    }

    try {
      setIsLoading(true)
      console.log(`🔐 Login requested for: ${email} (forcing hard reload)`) 
      sessionStorage.setItem('autoLoginEmail', email.trim())
      window.location.replace(`/login?reload=1&ts=${Date.now()}`)
    } catch (error) {
      console.error('Login setup failed:', error)
      const errorMessage = 'Seite konnte nicht neu geladen werden. Bitte manuell aktualisieren.'
      toast.error(errorMessage)
      setLastError(errorMessage)
      setIsLoading(false)
    }
  }

  const quickLogin = (userEmail: string) => {
    try {
      console.log(`🚀 Quick login requested for: ${userEmail} (forcing hard reload)`) 
      // Store intended email and force a full reload with cache-busting param
      sessionStorage.setItem('autoLoginEmail', userEmail)
      window.location.replace(`/login?reload=1&ts=${Date.now()}`)
    } catch (error) {
      console.error('Quick login setup failed:', error)
      const errorMessage = 'Seite konnte nicht neu geladen werden. Bitte manuell aktualisieren.'
      toast.error(errorMessage)
      setLastError(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <ShoppingCart className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Self-Service-Portal
          </h1>
          <p className="text-gray-600 text-lg">
            IT-Equipment und Büromaterial online bestellen
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔐 Anmelden
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>
                E-Mail-Adresse eingeben, um das Portal zu nutzen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    E-Mail-Adresse
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@bund.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className={`bg-white text-gray-900 placeholder:text-gray-500 ${
                      lastError ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                    autoComplete="email"
                  />
                </div>

                {/* Error Display */}
                {lastError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-700">{lastError}</p>
                  </div>
                )}

                {/* Retry Counter */}
                {retryCount > 0 && (
                  <div className="text-sm text-orange-600 text-center">
                    Versuche: {retryCount} - Bitte versuchen Sie es erneut
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Anmelden...
                    </>
                  ) : (
                    'Anmelden'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🚀 Schnell-Anmeldung (Demo)
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>
                Testkonto auswählen, um das Portal zu erkunden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Hauptnutzer - Mitarbeiter und Führungskraft */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">👥 Hauptnutzer</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start hover:bg-green-50 hover:border-green-300"
                      onClick={() => quickLogin('user@bund.de')}
                      disabled={isLoading}
                    >
                      <div className="text-left">
                        <div className="font-medium flex items-center gap-2">
                          👤 Mitarbeiter
                        </div>
                        <div className="text-xs text-gray-500">user@bund.de</div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start hover:bg-orange-50 hover:border-orange-300"
                      onClick={() => quickLogin('manager@bund.de')}
                      disabled={isLoading}
                    >
                      <div className="text-left">
                        <div className="font-medium flex items-center gap-2">
                          👔 Führungskraft
                        </div>
                        <div className="text-xs text-gray-500">manager@bund.de</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Support-Rollen */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">🛠️ Support & Verwaltung</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start hover:bg-blue-50 hover:border-blue-300"
                      onClick={() => quickLogin('it@bund.de')}
                      disabled={isLoading}
                    >
                      <div className="text-left">
                        <div className="font-medium flex items-center gap-2">
                          💻 IT-Support
                        </div>
                        <div className="text-xs text-gray-500">it@bund.de</div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start hover:bg-purple-50 hover:border-purple-300"
                      onClick={() => quickLogin('reception@bund.de')}
                      disabled={isLoading}
                    >
                      <div className="text-left">
                        <div className="font-medium flex items-center gap-2">
                          🏢 Empfang
                        </div>
                        <div className="text-xs text-gray-500">reception@bund.de</div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start hover:bg-red-50 hover:border-red-300"
                      onClick={() => quickLogin('admin@bund.de')}
                      disabled={isLoading}
                    >
                      <div className="text-left">
                        <div className="font-medium flex items-center gap-2">
                          ⚙️ Admin
                        </div>
                        <div className="text-xs text-gray-500">admin@bund.de</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>MVP-Demo – simuliert Azure AD / Entra ID</p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Lade Anmeldung...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

