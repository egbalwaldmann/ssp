'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ChevronRight, Clock } from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/workflow'
import { OrderStatus } from '@prisma/client'

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  createdAt: string
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Bestellungen werden geladen...</p>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Noch keine Bestellungen</h2>
          <p className="text-gray-600 mb-6">
            Beginnen Sie mit dem Einkaufen, um Ihre erste Bestellung zu erstellen
          </p>
          <Link href="/catalog">
            <Button>Katalog durchsuchen</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📋 Meine Bestellungen</h1>
        <p className="text-gray-700 mt-2 font-medium">Verfolgen und verwalten Sie Ihre Bestellungen</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-lg">
                      Bestellung #{order.orderNumber}
                    </h3>
                    <Badge className={STATUS_COLORS[order.status]}>
                      {STATUS_LABELS[order.status]}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} Artikel
                    </div>
                    {order._count?.comments && order._count.comments > 0 && (
                      <div className="flex items-center gap-1">
                        💬 {order._count.comments} Kommentare
                      </div>
                    )}
                  </div>

                  {/* Bestellte Artikel - Prominent anzeigen */}
                  <div className="mt-3 space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">📦 Bestellte Artikel:</h4>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-base font-medium text-gray-800 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100"
                        >
                          <span className="font-bold text-blue-600">{item.quantity}×</span>
                          <span>{item.product.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

