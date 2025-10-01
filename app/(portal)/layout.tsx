'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Package, LayoutDashboard, LogOut, User } from 'lucide-react'
import { useCart } from '@/lib/store/cart-store'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { getTotalItems } = useCart()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isAgent = ['IT_SUPPORT', 'EMPFANG', 'APPROVER', 'ADMIN'].includes(session.user.role)
  const cartItemsCount = getTotalItems()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      REQUESTER: 'Anforderer',
      IT_SUPPORT: 'IT-Support',
      EMPFANG: 'Empfang',
      APPROVER: 'Genehmiger',
      ADMIN: 'Admin'
    }
    return roleLabels[role] || role
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/catalog" className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">
                  SSP
                </span>
              </Link>

              <nav className="hidden md:flex items-center space-x-1">
                <Link href="/catalog">
                  <Button
                    variant={pathname === '/catalog' ? 'default' : 'ghost'}
                    className="flex items-center space-x-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Katalog</span>
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button
                    variant={pathname?.startsWith('/orders') ? 'default' : 'ghost'}
                    className="flex items-center space-x-2"
                  >
                    <Package className="h-4 w-4" />
                    <span>Meine Bestellungen</span>
                  </Button>
                </Link>
                {isAgent && (
                  <Link href="/dashboard">
                    <Button
                      variant={pathname === '/dashboard' ? 'default' : 'ghost'}
                      className="flex items-center space-x-2 relative"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                      {session?.user?.role === 'APPROVER' && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          !
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )}
                {session?.user?.role === 'ADMIN' && (
                  <>
                    <Link href="/admin/users">
                      <Button
                        variant={pathname === '/admin/users' ? 'default' : 'ghost'}
                        className="flex items-center space-x-2"
                      >
                        <span>👥</span>
                        <span>Nutzer</span>
                      </Button>
                    </Link>
                    <Link href="/admin/logs">
                      <Button
                        variant={pathname === '/admin/logs' ? 'default' : 'ghost'}
                        className="flex items-center space-x-2"
                      >
                        <span>📊</span>
                        <span>Logs</span>
                      </Button>
                    </Link>
                  </>
                )}
                {session?.user?.role && session.user.role !== 'REQUESTER' && (
                  <Link href="/admin/products">
                    <Button
                      variant={pathname === '/admin/products' ? 'default' : 'ghost'}
                      className="flex items-center space-x-2"
                    >
                      <span>📦</span>
                      <span>Produkte verwalten</span>
                    </Button>
                  </Link>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/cart">
                <Button variant="outline" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-blue-600"
                    >
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(session.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{session.user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-gray-500">{session.user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {getRoleLabel(session.user.role)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {session.user.costCenter}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>Self-Service-Portal MVP © 2025</p>
            <p className="mt-1">
              Abteilung: {session.user.department} | Kostenstelle: {session.user.costCenter}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

