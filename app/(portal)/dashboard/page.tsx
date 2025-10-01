'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Pause,
  TrendingUp,
  ChevronRight
} from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS, ALLOWED_TRANSITIONS } from '@/lib/workflow'
import { OrderStatus } from '@prisma/client'

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  createdAt: string
  user: {
    name: string
    email: string
    department: string
  }
  items: Array<{
    quantity: number
    product: {
      name: string
    }
  }>
  _count: {
    comments: number
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('')
  const [statusNote, setStatusNote] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [approvalComment, setApprovalComment] = useState('')
  const [isProcessingApproval, setIsProcessingApproval] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      const isAgent = session?.user?.role && ['IT_AGENT', 'RECEPTION_AGENT', 'APPROVER', 'ADMIN'].includes(session.user.role)
      
      if (!isAgent) {
        toast.error('Zugriff verweigert. Nur für Agenten und Genehmiger.')
        router.push('/catalog')
        return
      }

      fetchOrders()
    }
  }, [status, session, router])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      toast.error('Bestellungen konnten nicht geladen werden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) {
      return
    }

    setIsUpdatingStatus(true)

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote.trim() || undefined
        })
      })

      if (res.ok) {
        toast.success('Bestellstatus aktualisiert')
        setSelectedOrder(null)
        setNewStatus('')
        setStatusNote('')
        fetchOrders()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Status konnte nicht aktualisiert werden')
      }
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleApproval = async (approved: boolean) => {
    if (!selectedOrder) {
      return
    }

    setIsProcessingApproval(true)

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved,
          comment: approvalComment.trim() || undefined
        })
      })

      if (res.ok) {
        toast.success(approved ? 'Bestellung genehmigt' : 'Bestellung abgelehnt')
        setSelectedOrder(null)
        setApprovalComment('')
        fetchOrders()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Genehmigung konnte nicht bearbeitet werden')
      }
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten')
    } finally {
      setIsProcessingApproval(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Dashboard wird geladen...</p>
        </div>
      </div>
    )
  }

  const stats = {
    total: orders.length,
    new: orders.filter((o) => o.status === 'NEW').length,
    inReview: orders.filter((o) => o.status === 'IN_REVIEW').length,
    pendingApproval: orders.filter((o) => o.status === 'PENDING_APPROVAL').length,
    completed: orders.filter((o) => o.status === 'COMPLETED').length
  }

  const pendingOrders = orders.filter((o) =>
    ['NEW', 'IN_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'ORDERED'].includes(o.status)
  )

  const allowedTransitions = selectedOrder
    ? ALLOWED_TRANSITIONS[selectedOrder.status] || []
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Bestellungs-Dashboard</h1>
        <p className="text-gray-700 mt-2 font-medium">Bestellungen verwalten und bearbeiten</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">📦 Gesamtbestellungen</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">🆕 Neu</p>
                <p className="text-2xl font-bold">{stats.new}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">🔍 In Prüfung</p>
                <p className="text-2xl font-bold">{stats.inReview}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">⏳ Wartet auf Genehmigung</p>
                <p className="text-2xl font-bold">{stats.pendingApproval}</p>
              </div>
              <Pause className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">✅ Abgeschlossen</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Section for Approvers */}
      {['APPROVER', 'ADMIN'].includes(session?.user?.role || '') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⏳ Genehmigungen erforderlich
              <Badge variant="destructive" className="ml-2">
                {orders.filter(o => o.status === 'PENDING_APPROVAL').length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.filter(o => o.status === 'PENDING_APPROVAL').length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Keine Bestellungen zur Genehmigung
              </div>
            ) : (
              <div className="space-y-3">
                {orders.filter(o => o.status === 'PENDING_APPROVAL').map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition"
                  >
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold">#{order.orderNumber}</span>
                        <Badge className="bg-orange-600 text-white">
                          ⏳ Wartet auf Genehmigung
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{order.user.name}</span>
                        <span>•</span>
                        <span>{order.user.department}</span>
                        <span>•</span>
                        <span>
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} Artikel
                        </span>
                        <span>•</span>
                        <span>{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedOrder(order)
                          setApprovalAction('approve')
                        }}
                      >
                        ✅ Genehmigen
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedOrder(order)
                          setApprovalAction('reject')
                        }}
                      >
                        ❌ Ablehnen
                      </Button>
                      <Link href={`/orders/${order.id}`}>
                        <Button size="sm" variant="ghost">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pending Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Ausstehende Bestellungen</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Keine ausstehenden Bestellungen
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold">#{order.orderNumber}</span>
                      <Badge className={STATUS_COLORS[order.status]}>
                        {STATUS_LABELS[order.status]}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{order.user.name}</span>
                      <span>•</span>
                      <span>{order.user.department}</span>
                      <span>•</span>
                      <span>
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} Artikel
                      </span>
                      <span>•</span>
                      <span>{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'PENDING_APPROVAL' && ['APPROVER', 'ADMIN'].includes(session?.user?.role || '') && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedOrder(order)
                            setApprovalAction('approve')
                          }}
                        >
                          ✅ Genehmigen
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedOrder(order)
                            setApprovalAction('reject')
                          }}
                        >
                          ❌ Ablehnen
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Status aktualisieren
                    </Button>
                    <Link href={`/orders/${order.id}`}>
                      <Button size="sm" variant="ghost">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Bestellungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">#{order.orderNumber}</span>
                    <Badge className={`${STATUS_COLORS[order.status]} text-xs`}>
                      {STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.user.name} • {format(new Date(order.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <Link href={`/orders/${order.id}`}>
                  <Button size="sm" variant="ghost">
                    Anzeigen
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => {
        setSelectedOrder(null)
        setApprovalAction(null)
        setApprovalComment('')
        setNewStatus('')
        setStatusNote('')
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction ? 
                (approvalAction === 'approve' ? 'Bestellung genehmigen' : 'Bestellung ablehnen') : 
                'Bestellstatus aktualisieren'
              }
            </DialogTitle>
            <DialogDescription>
              Bestellung #{selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Aktueller Status</label>
              <div>
                <Badge className={selectedOrder ? STATUS_COLORS[selectedOrder.status] : ''}>
                  {selectedOrder ? STATUS_LABELS[selectedOrder.status] : ''}
                </Badge>
              </div>
            </div>

            {approvalAction ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {approvalAction === 'approve' ? 'Genehmigungskommentar (Optional)' : 'Ablehnungsgrund (Optional)'}
                </label>
                <Textarea
                  placeholder={
                    approvalAction === 'approve' 
                      ? 'Fügen Sie einen Kommentar zur Genehmigung hinzu...' 
                      : 'Geben Sie den Grund für die Ablehnung an...'
                  }
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  rows={3}
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Neuer Status</label>
                  <Select value={newStatus} onValueChange={(val) => setNewStatus(val as OrderStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Neuen Status auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedTransitions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notiz (Optional)</label>
                  <Textarea
                    placeholder="Fügen Sie eine Notiz zu dieser Statusänderung hinzu..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedOrder(null)
              setApprovalAction(null)
              setApprovalComment('')
              setNewStatus('')
              setStatusNote('')
            }}>
              Abbrechen
            </Button>
            {approvalAction ? (
              <Button
                onClick={() => handleApproval(approvalAction === 'approve')}
                disabled={isProcessingApproval}
                className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {isProcessingApproval ? 'Wird bearbeitet...' : 
                  (approvalAction === 'approve' ? '✅ Genehmigen' : '❌ Ablehnen')
                }
              </Button>
            ) : (
              <Button
                onClick={handleUpdateStatus}
                disabled={!newStatus || isUpdatingStatus}
              >
                {isUpdatingStatus ? 'Wird aktualisiert...' : 'Status aktualisieren'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

