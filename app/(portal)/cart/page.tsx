'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/lib/store/cart-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ShoppingCart, Trash2, Plus, Minus, Package } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, removeItem, updateQuantity, clearCart } = useCart()
  const [specialRequest, setSpecialRequest] = useState('')
  const [justification, setJustification] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity
        })),
        specialRequest: specialRequest.trim() || undefined,
        justification: justification.trim() || undefined
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (res.ok) {
        const order = await res.json()
        clearCart()
        toast.success('Order submitted successfully!')
        router.push(`/orders/${order.id}`)
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to submit order')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasItemsRequiringApproval = items.some((item) => item.requiresApproval)

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Browse our catalog and add items to your cart
          </p>
          <Link href="/catalog">
            <Button>
              <Package className="h-4 w-4 mr-2" />
              Browse Catalog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-gray-600 mt-2">Review your items and submit your order</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <Package className="h-8 w-8 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {item.model && (
                      <p className="text-sm text-gray-500">Model: {item.model}</p>
                    )}
                    {item.requiresApproval && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Requires approval
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const qty = parseInt(e.target.value) || 1
                        updateQuantity(item.id, Math.max(1, qty))
                      }}
                      className="w-16 text-center"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cost Center:</span>
                  <span className="font-medium">{session?.user.costCenter}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="special-request" className="text-sm font-medium">
                  Special Requests (Optional)
                </label>
                <Textarea
                  id="special-request"
                  placeholder="Any additional items or special requirements..."
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  rows={3}
                />
                {specialRequest.trim() && (
                  <p className="text-xs text-orange-600">
                    ⚠️ Special requests require approval
                  </p>
                )}
              </div>

              {(hasItemsRequiringApproval || specialRequest.trim()) && (
                <div className="space-y-2">
                  <label htmlFor="justification" className="text-sm font-medium">
                    Justification <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="justification"
                    placeholder="Please provide a justification for items requiring approval..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={3}
                    required={hasItemsRequiringApproval || !!specialRequest.trim()}
                  />
                  <p className="text-xs text-gray-500">
                    Required for items needing approval
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleCheckout}
                className="w-full"
                disabled={
                  isSubmitting ||
                  ((hasItemsRequiringApproval || !!specialRequest.trim()) &&
                    justification.trim().length === 0)
                }
              >
                {isSubmitting ? 'Submitting...' : 'Submit Order'}
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-sm space-y-2">
              <p className="font-medium text-blue-900">📋 Note:</p>
              <ul className="list-disc list-inside text-blue-800 space-y-1 text-xs">
                <li>Orders are processed within 2-3 business days</li>
                <li>You'll receive updates via email</li>
                <li>Track your order status anytime</li>
                {hasItemsRequiringApproval && (
                  <li className="text-orange-600 font-medium">
                    This order requires manager approval
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

