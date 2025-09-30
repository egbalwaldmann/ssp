'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { ShoppingCart } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        redirect: false
      })

      if (result?.error) {
        toast.error('Invalid email. Please use a registered email address.')
      } else {
        toast.success('Login successful!')
        router.push('/catalog')
        router.refresh()
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const quickLogin = async (userEmail: string) => {
    setEmail(userEmail)
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: userEmail,
        redirect: false
      })

      if (result?.error) {
        toast.error('Login failed')
      } else {
        toast.success('Login successful!')
        router.push('/catalog')
        router.refresh()
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
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
            Self-Service Portal
          </h1>
          <p className="text-gray-600 text-lg">
            Order IT equipment and office supplies online
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your email address to access the portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@bund.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Login (Demo)</CardTitle>
              <CardDescription>
                Select a test account to explore the portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => quickLogin('user@bund.de')}
                  disabled={isLoading}
                >
                  <div className="text-left">
                    <div className="font-medium">Test User</div>
                    <div className="text-xs text-gray-500">user@bund.de (Requester)</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => quickLogin('it@bund.de')}
                  disabled={isLoading}
                >
                  <div className="text-left">
                    <div className="font-medium">IT Support</div>
                    <div className="text-xs text-gray-500">it@bund.de (IT Agent)</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => quickLogin('reception@bund.de')}
                  disabled={isLoading}
                >
                  <div className="text-left">
                    <div className="font-medium">Reception</div>
                    <div className="text-xs text-gray-500">reception@bund.de (Reception Agent)</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => quickLogin('manager@bund.de')}
                  disabled={isLoading}
                >
                  <div className="text-left">
                    <div className="font-medium">Manager</div>
                    <div className="text-xs text-gray-500">manager@bund.de (Approver)</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => quickLogin('admin@bund.de')}
                  disabled={isLoading}
                >
                  <div className="text-left">
                    <div className="font-medium">Admin</div>
                    <div className="text-xs text-gray-500">admin@bund.de (Admin)</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>MVP Demo - Simulates Azure AD / Entra ID authentication</p>
        </div>
      </div>
    </div>
  )
}

