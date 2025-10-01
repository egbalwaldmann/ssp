'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Users, Plus, Edit, Trash2 } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  role: 'REQUESTER' | 'IT_SUPPORT' | 'EMPFANG' | 'APPROVER' | 'ADMIN'
  costCenter: string
  department: string
  createdAt: string
}

const ROLE_LABELS = {
  REQUESTER: '👤 Mitarbeiter',
  IT_SUPPORT: '💻 IT-Support',
  EMPFANG: '🏢 Empfang',
  APPROVER: '👔 Führungskraft',
  ADMIN: '⚙️ Admin'
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'REQUESTER' as const,
    costCenter: '',
    department: ''
  })

  // Check if user is admin
  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/catalog')
    }
  }, [session, router])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast.error('Fehler beim Laden der Nutzer')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Fehler beim Laden der Nutzer')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.name || !newUser.costCenter || !newUser.department) {
      toast.error('Bitte alle Felder ausfüllen')
      return
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        toast.success('Nutzer erfolgreich erstellt')
        setIsCreateDialogOpen(false)
        setNewUser({
          email: '',
          name: '',
          role: 'REQUESTER',
          costCenter: '',
          department: ''
        })
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Fehler beim Erstellen des Nutzers')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Fehler beim Erstellen des Nutzers')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Nutzer löschen möchten?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Nutzer erfolgreich gelöscht')
        fetchUsers()
      } else {
        toast.error('Fehler beim Löschen des Nutzers')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Fehler beim Löschen des Nutzers')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Lade Nutzer...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👥 Nutzerverwaltung</h1>
          <p className="text-gray-700 mt-2 font-medium">
            Verwalten Sie alle Nutzer des Systems
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nutzer hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Nutzer erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie einen neuen Nutzer für das System
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">E-Mail-Adresse</label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="nutzer@bund.de"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Max Mustermann"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Rolle</label>
                <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REQUESTER">👤 Mitarbeiter</SelectItem>
                    <SelectItem value="IT_SUPPORT">💻 IT-Support</SelectItem>
                    <SelectItem value="EMPFANG">🏢 Empfang</SelectItem>
                    <SelectItem value="APPROVER">👔 Führungskraft</SelectItem>
                    <SelectItem value="ADMIN">⚙️ Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Kostenstelle</label>
                <Input
                  value={newUser.costCenter}
                  onChange={(e) => setNewUser({ ...newUser, costCenter: e.target.value })}
                  placeholder="CC-001"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Abteilung</label>
                <Input
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  placeholder="Marketing"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleCreateUser}>
                Nutzer erstellen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <Badge 
                      className={`text-sm px-3 py-1 ${
                        user.role === 'ADMIN' 
                          ? 'bg-red-100 text-red-800 border-red-200' 
                          : user.role === 'APPROVER'
                          ? 'bg-orange-100 text-orange-800 border-orange-200'
                          : user.role === 'IT_SUPPORT'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : user.role === 'EMPFANG'
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><span className="font-medium">E-Mail:</span> {user.email}</p>
                      <p><span className="font-medium">Kostenstelle:</span> {user.costCenter}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Abteilung:</span> {user.department}</p>
                      <p><span className="font-medium">Erstellt:</span> {new Date(user.createdAt).toLocaleDateString('de-DE')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user.id !== session?.user?.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">📋 Rollenübersicht:</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-800 mb-1">👤 Mitarbeiter (REQUESTER):</h4>
            <p className="text-gray-600">Können Produkte bestellen und ihre Bestellungen verwalten</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-1">👔 Führungskraft (APPROVER):</h4>
            <p className="text-gray-600">Können Bestellungen genehmigen und ablehnen</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-1">💻 IT-Support (IT_SUPPORT):</h4>
            <p className="text-gray-600">Können IT-Produkte verwalten und hinzufügen</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-1">🏢 Empfang (EMPFANG):</h4>
            <p className="text-gray-600">Können Büroprodukte verwalten und hinzufügen</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-1">⚙️ Admin (ADMIN):</h4>
            <p className="text-gray-600">Vollzugriff auf alle Funktionen</p>
          </div>
        </div>
      </div>
    </div>
  )
}
