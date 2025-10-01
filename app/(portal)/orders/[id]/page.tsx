'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Package,
  User,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Circle,
  Clock,
  Building
} from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/workflow'
import { OrderStatus } from '@prisma/client'

interface OrderDetail {
  id: string
  orderNumber: string
  status: OrderStatus
  costCenter: string
  specialRequest: string | null
  justification: string | null
  createdAt: string
  user: {
    name: string
    email: string
    department: string
  }
  items: Array<{
    id: string
    quantity: number
    product: {
      name: string
      model: string | null
      imageUrl: string | null
    }
  }>
  comments: Array<{
    id: string
    content: string
    isInternal: boolean
    createdAt: string
    user: {
      name: string
      role: string
    }
  }>
  statusHistory: Array<{
    id: string
    fromStatus: OrderStatus | null
    toStatus: OrderStatus
    note: string | null
    createdAt: string
  }>
  approvals: Array<{
    id: string
    status: string
    comment: string | null
    createdAt: string
    decidedAt: string | null
    approver: {
      name: string
      email: string
    }
  }>
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { data: session } = useSession()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${resolvedParams.id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      } else {
        toast.error('Bestellung konnte nicht geladen werden')
      }
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast.error('Bitte geben Sie einen Kommentar ein')
      return
    }

    setIsSubmittingComment(true)

    try {
      const res = await fetch(`/api/orders/${resolvedParams.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment })
      })

      if (res.ok) {
        toast.success('Kommentar hinzugefügt')
        setComment('')
        fetchOrder()
      } else {
        toast.error('Kommentar konnte nicht hinzugefügt werden')
      }
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Bestellung wird geladen...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bestellung nicht gefunden</h2>
        <p className="text-gray-600">Diese Bestellung existiert nicht oder Sie haben keinen Zugriff darauf</p>
      </div>
    )
  }

  const isAgent = session?.user?.role && ['IT_SUPPORT', 'EMPFANG', 'APPROVER', 'ADMIN'].includes(session.user.role)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bestellung #{order.orderNumber}
          </h1>
          <p className="text-gray-600 mt-2">
            Eingereicht am {format(new Date(order.createdAt), 'd. MMMM yyyy, HH:mm')}
          </p>
        </div>
        <Badge className={`${STATUS_COLORS[order.status]} text-base px-4 py-2`}>
          {STATUS_LABELS[order.status]}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Bestellungsverlauf
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.statusHistory.map((history, index) => {
                  const isLast = index === order.statusHistory.length - 1
                  const isCurrent = history.toStatus === order.status

                  return (
                    <div key={history.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        {isCurrent ? (
                          <CheckCircle2 className="h-6 w-6 text-blue-600" />
                        ) : (
                          <Circle className="h-6 w-6 text-gray-300" />
                        )}
                        {!isLast && (
                          <div className="w-0.5 h-12 bg-gray-200 my-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {STATUS_LABELS[history.toStatus]}
                          </span>
                          {isCurrent && (
                            <Badge variant="secondary" className="text-xs">
                              Aktuell
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {format(new Date(history.createdAt), 'd. MMM yyyy, HH:mm')}
                        </p>
                        {history.note && (
                          <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                            {history.note}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Bestellartikel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-16 h-16 bg-white rounded flex items-center justify-center">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <Package className="h-6 w-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      {item.product.model && (
                        <p className="text-sm text-gray-600">
                          Modell: {item.product.model}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Anzahl: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Kommunikation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.comments.length > 0 ? (
                <div className="space-y-3">
                  {order.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-3 rounded-lg ${
                        comment.isInternal
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {comment.user.name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {comment.user.role.replace(/_/g, ' ')}
                          </Badge>
                          {comment.isInternal && (
                            <Badge variant="outline" className="text-xs">
                              Intern
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(new Date(comment.createdAt), 'd. MMM, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Noch keine Kommentare
                </p>
              )}

              <div className="space-y-2 pt-4 border-t">
                <Textarea
                  id="order-comment"
                  name="order-comment"
                  placeholder="Kommentar oder Frage hinzufügen..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={isSubmittingComment || !comment.trim()}
                >
                  {isSubmittingComment ? 'Wird hinzugefügt...' : 'Kommentar hinzufügen'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bestellinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600">Antragsteller</p>
                  <p className="font-medium">{order.user.name}</p>
                  <p className="text-gray-500 text-xs">{order.user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Building className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600">Abteilung</p>
                  <p className="font-medium">{order.user.department}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600">Kostenstelle</p>
                  <p className="font-medium">{order.costCenter}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.specialRequest && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sonderwunsch</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{order.specialRequest}</p>
              </CardContent>
            </Card>
          )}

          {order.justification && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Begründung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{order.justification}</p>
              </CardContent>
            </Card>
          )}

          {order.approvals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Genehmigungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.approvals.map((approval) => (
                    <div key={approval.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {approval.approver.name}
                        </span>
                        <Badge
                          variant={
                            approval.status === 'APPROVED'
                              ? 'default'
                              : approval.status === 'REJECTED'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {approval.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {approval.approver.email}
                      </p>
                      {approval.comment && (
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2">
                          {approval.comment}
                        </p>
                      )}
                      {approval.decidedAt && (
                        <p className="text-xs text-gray-500">
                          {format(new Date(approval.decidedAt), 'd. MMM yyyy')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

