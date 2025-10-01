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
  specialRequest?: string | null
  justification?: string | null
  user: {
    name: string
    email: string
    department: string
  }
  items: Array<{
    quantity: number
    product: {
      name: string
      model: string
      category: string
      description: string
      requiresApproval: boolean
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {session?.user?.role === 'APPROVER' ? '⏳ Genehmiger-Dashboard' : '📊 Bestellungs-Dashboard'}
            </h1>
            <p className="text-gray-700 mt-2 font-medium">
              {session?.user?.role === 'APPROVER' 
                ? 'Bestellungen genehmigen und ablehnen' 
                : 'Bestellungen verwalten und bearbeiten'
              }
            </p>
          </div>
          
          {/* Fallback Status Indicator */}
          <div className="flex items-center space-x-2 text-sm bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-yellow-700 font-medium">Demo-Daten</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500 bg-blue-50/30 h-32">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-blue-700 font-medium">📦 Gesamtbestellungen</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-auto">
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500 bg-gray-50/30 h-32">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-700 font-medium">🆕 Neu</p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
            <div className="mt-auto">
              <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/30 h-32">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-yellow-700 font-medium">🔍 In Prüfung</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-auto">
              <p className="text-2xl font-bold text-yellow-900">{stats.inReview}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-orange-50/30 h-32">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-orange-700 font-medium">⏳ Wartet auf Genehmigung</p>
              </div>
              <Pause className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-auto">
              <p className="text-2xl font-bold text-orange-900">{stats.pendingApproval}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-green-50/30 h-32">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-green-700 font-medium">✅ Abgeschlossen</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-auto">
              <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Section for Approvers */}
      {['APPROVER', 'ADMIN'].includes(session?.user?.role || '') && (
        <Card className="border-2 border-orange-300 shadow-lg bg-gradient-to-r from-orange-50 to-orange-100/50">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-orange-200 border-b border-orange-300">
            <CardTitle className="flex items-center gap-2 text-xl text-orange-900">
              ⏳ Genehmigungen erforderlich
              <Badge className="ml-2 text-lg px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white border-orange-700">
                {orders.filter(o => o.status === 'PENDING_APPROVAL').length}
              </Badge>
            </CardTitle>
            <p className="text-orange-800 mt-2 font-medium">
              {orders.filter(o => o.status === 'PENDING_APPROVAL').length === 0 
                ? 'Alle Bestellungen wurden bearbeitet' 
                : `${orders.filter(o => o.status === 'PENDING_APPROVAL').length} Bestellung(en) warten auf Ihre Genehmigung`
              }
            </p>
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
                    className="p-6 bg-white border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <span className="font-bold text-lg">#{order.orderNumber}</span>
                          <Badge className="bg-orange-600 text-white">
                            ⏳ Wartet auf Genehmigung
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="font-medium">{order.user.name}</span>
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
                    </div>

                    {/* Bestellte Artikel */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">📦 Bestellte Artikel:</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{item.product.name}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">Modell: {item.product.model}</span>
                                <span className="mx-2">•</span>
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">Kategorie: {item.product.category}</span>
                              </div>
                              <div className="text-sm text-gray-500 mt-2 bg-white p-2 rounded border">
                                {item.product.description}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg text-blue-600">Menge: {item.quantity}</div>
                              {item.product.requiresApproval && (
                                <Badge className="text-xs mt-2 bg-red-100 text-red-800 border-red-200">
                                  ⚠️ Genehmigung erforderlich
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sonderwünsche und Begründung */}
                    {(order.specialRequest || order.justification) && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">📝 Zusätzliche Informationen:</h4>
                        <div className="space-y-2">
                          {order.specialRequest && (
                            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 shadow-sm">
                              <div className="font-semibold text-blue-900 mb-2">💡 Sonderwunsch:</div>
                              <div className="text-blue-800 bg-white p-3 rounded border">{order.specialRequest}</div>
                            </div>
                          )}
                          {order.justification && (
                            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200 shadow-sm">
                              <div className="font-semibold text-green-900 mb-2">📝 Begründung:</div>
                              <div className="text-green-800 bg-white p-3 rounded border">{order.justification}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-4 border-t border-orange-200">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
                        onClick={() => {
                          setSelectedOrder(order)
                          setApprovalAction('approve')
                        }}
                      >
                        ✅ Genehmigen
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
                        onClick={() => {
                          setSelectedOrder(order)
                          setApprovalAction('reject')
                        }}
                      >
                        ❌ Ablehnen
                      </Button>
                      <Link href={`/orders/${order.id}`}>
                        <Button size="sm" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-2 rounded-lg border border-gray-300 transition-all">
                          <ChevronRight className="h-4 w-4 mr-1" />
                          Details
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
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="bg-blue-50 border-b border-blue-200">
          <CardTitle className="text-blue-900">📋 Ausstehende Bestellungen</CardTitle>
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
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
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
      <Card className="border-l-4 border-l-gray-500">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-gray-900">📊 Alle Bestellungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
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
                  id="approval-comment"
                  name="approval-comment"
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
                    id="status-note"
                    name="status-note"
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

