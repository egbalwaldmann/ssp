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
import { logger } from '@/lib/logger'

export default function CartPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, removeItem, updateQuantity, clearCart } = useCart()
  const [specialRequest, setSpecialRequest] = useState('')
  const [justification, setJustification] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Business card details
  const [businessCardDetails, setBusinessCardDetails] = useState({
    fullName: session?.user?.name || '',
    jobTitle: '',
    department: session?.user?.department || '',
    email: session?.user?.email || '',
    phone: '',
    mobile: ''
  })
  
  // Check if cart contains business cards
  const hasBusinessCards = items.some(item => 
    item.name.toLowerCase().includes('visitenkarte')
  )

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Ihr Warenkorb ist leer')
      logger.warn('Checkout attempted with empty cart')
      return
    }

    // Check if justification is required for items that need approval
    const needsApproval = items.some(item => item.requiresApproval)
    if (needsApproval && !justification.trim()) {
      toast.error('Begründung ist für Artikel mit Genehmigungspflicht erforderlich')
      logger.warn('Checkout attempted without required justification', { needsApproval, hasJustification: !!justification.trim() })
      return
    }
    
    // Check if business card details are complete
    if (hasBusinessCards) {
      if (!businessCardDetails.fullName || !businessCardDetails.jobTitle || !businessCardDetails.email) {
        toast.error('Bitte füllen Sie alle Pflichtfelder für Visitenkarten aus')
        return
      }
    }

    setIsSubmitting(true)
    logger.info('Starting checkout process', { 
      itemCount: items.length, 
      needsApproval, 
      hasSpecialRequest: !!specialRequest.trim(),
      userId: session?.user?.id 
    })

    try {
      const orderData: any = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity
        })),
        costCenter: 'CC-001', // Set default cost center
        specialRequest: specialRequest.trim() || undefined,
        justification: justification.trim() || undefined
      }
      
      // Add business card details if applicable
      if (hasBusinessCards) {
        orderData.businessCard = {
          fullName: businessCardDetails.fullName,
          jobTitle: businessCardDetails.jobTitle,
          department: businessCardDetails.department,
          email: businessCardDetails.email,
          phone: businessCardDetails.phone || null,
          mobile: businessCardDetails.mobile || null,
          quantity: 250
        }
      }

      logger.debug('Sending order data', orderData)

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (res.ok) {
        const order = await res.json()
        logger.info('Order created successfully', { orderId: order.id, orderNumber: order.orderNumber })
        clearCart()
        toast.success(`🎉 Bestellung ${order.orderNumber} erfolgreich eingereicht!`)
        router.push('/orders')
      } else {
        const error = await res.json()
        logger.error('Order creation failed', { 
          status: res.status, 
          error, 
          orderData,
          userId: session?.user?.id 
        })
        
        // If products are missing, clear the cart and redirect to catalog
        if (error.error && error.error.includes('Produkte nicht gefunden')) {
          logger.warn('Products not found, clearing cart', { missingProducts: error.missingProducts })
          clearCart()
          toast.error('Einige Produkte sind nicht mehr verfügbar. Warenkorb wurde geleert.')
          router.push('/catalog')
        } else {
          toast.error(error.error || 'Bestellung konnte nicht eingereicht werden')
        }
      }
    } catch (error) {
      logger.captureError(error instanceof Error ? error : new Error(String(error)), 'Checkout process')
      toast.error('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ihr Warenkorb ist leer</h2>
          <p className="text-gray-600 mb-6">
            Durchsuchen Sie unseren Katalog und fügen Sie Artikel zu Ihrem Warenkorb hinzu
          </p>
          <Link href="/catalog">
            <Button>
              <Package className="h-4 w-4 mr-2" />
              Katalog durchsuchen
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🛒 Warenkorb</h1>
        <p className="text-gray-700 mt-2 font-medium">Überprüfen Sie Ihre Artikel und reichen Sie Ihre Bestellung ein</p>
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
                      <p className="text-sm text-gray-500">Modell: {item.model}</p>
                    )}
                    {item.requiresApproval && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Genehmigung erforderlich
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
                      id={`quantity-${item.id}`}
                      name={`quantity-${item.id}`}
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
            <CardHeader className="bg-blue-50 border-b border-blue-200">
              <CardTitle className="text-xl font-bold text-blue-900">📋 Bestellübersicht</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">Gesamtanzahl Artikel:</span>
                  <span className="font-bold text-blue-600">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">Kostenstelle:</span>
                  <span className="font-bold text-blue-600">{session?.user.costCenter}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="special-request" className="text-sm font-semibold text-gray-800">
                  💬 Sonderwünsche (Optional)
                </label>
                <Textarea
                  id="special-request"
                  name="special-request"
                  placeholder="Zusätzliche Artikel oder besondere Anforderungen..."
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  rows={3}
                />
                {specialRequest.trim() && (
                  <p className="text-xs text-orange-600">
                    ⚠️ Sonderwünsche erfordern eine Genehmigung
                  </p>
                )}
              </div>

              {hasBusinessCards && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-blue-900">
                      🪪 Visitenkarten-Informationen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="bc-fullName" className="text-xs font-semibold text-gray-800 block mb-1">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="bc-fullName"
                          name="bc-fullName"
                          value={businessCardDetails.fullName}
                          onChange={(e) => setBusinessCardDetails({ ...businessCardDetails, fullName: e.target.value })}
                          placeholder="Max Mustermann"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="bc-jobTitle" className="text-xs font-semibold text-gray-800 block mb-1">
                          Jobtitel <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="bc-jobTitle"
                          name="bc-jobTitle"
                          value={businessCardDetails.jobTitle}
                          onChange={(e) => setBusinessCardDetails({ ...businessCardDetails, jobTitle: e.target.value })}
                          placeholder="Referent"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="bc-department" className="text-xs font-semibold text-gray-800 block mb-1">
                          Abteilung
                        </label>
                        <Input
                          id="bc-department"
                          name="bc-department"
                          value={businessCardDetails.department}
                          onChange={(e) => setBusinessCardDetails({ ...businessCardDetails, department: e.target.value })}
                          placeholder="Marketing"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="bc-email" className="text-xs font-semibold text-gray-800 block mb-1">
                          E-Mail <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="bc-email"
                          name="bc-email"
                          type="email"
                          value={businessCardDetails.email}
                          onChange={(e) => setBusinessCardDetails({ ...businessCardDetails, email: e.target.value })}
                          placeholder="max@bund.de"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="bc-phone" className="text-xs font-semibold text-gray-800 block mb-1">
                          Telefon
                        </label>
                        <Input
                          id="bc-phone"
                          name="bc-phone"
                          type="tel"
                          value={businessCardDetails.phone}
                          onChange={(e) => setBusinessCardDetails({ ...businessCardDetails, phone: e.target.value })}
                          placeholder="+49 30 123-456"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="bc-mobile" className="text-xs font-semibold text-gray-800 block mb-1">
                          Mobil
                        </label>
                        <Input
                          id="bc-mobile"
                          name="bc-mobile"
                          type="tel"
                          value={businessCardDetails.mobile}
                          onChange={(e) => setBusinessCardDetails({ ...businessCardDetails, mobile: e.target.value })}
                          placeholder="+49 170 123456"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(hasItemsRequiringApproval || specialRequest.trim()) && (
                <div className="space-y-2">
                  <label htmlFor="justification" className="text-sm font-semibold text-gray-800">
                    📝 Begründung <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="justification"
                    name="justification"
                    placeholder="Bitte geben Sie eine Begründung für Artikel an, die eine Genehmigung erfordern..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={3}
                    required={hasItemsRequiringApproval || !!specialRequest.trim()}
                  />
                  <p className="text-xs text-gray-500">
                    Erforderlich für Artikel, die eine Genehmigung benötigen
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
                {isSubmitting ? '⏳ Wird eingereicht...' : '✅ Bestellung einreichen'}
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-sm space-y-2">
              <p className="font-medium text-blue-900">📋 Hinweis:</p>
              <ul className="list-disc list-inside text-blue-800 space-y-1 text-xs">
                <li>Bestellungen werden innerhalb von 2-3 Werktagen bearbeitet</li>
                <li>Sie erhalten Updates per E-Mail</li>
                <li>Verfolgen Sie Ihren Bestellstatus jederzeit</li>
                {hasItemsRequiringApproval && (
                  <li className="text-orange-600 font-medium">
                    Diese Bestellung erfordert eine Manager-Genehmigung
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

