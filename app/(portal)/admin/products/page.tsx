'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Package, Edit, Save, X, Plus } from 'lucide-react'

interface Product {
  id: string
  name: string
  description?: string
  category: string
  model?: string
  price?: number
  requiresApproval: boolean
  responsibleRole: 'IT_SUPPORT' | 'EMPFANG'
  isActive: boolean
}

const RESPONSIBLE_ROLE_LABELS = {
  IT_SUPPORT: '💻 IT-Support',
  EMPFANG: '🏢 Empfang'
}

const CATEGORY_LABELS = {
  WEBCAM: '📹 Webcams',
  HEADSET: '🎧 Headsets',
  MOUSE: '🖱️ Mäuse',
  KEYBOARD: '⌨️ Tastaturen',
  PRINTER_TONER: '🖨️ Druckertoner',
  SPEAKERS: '🔊 Lautsprecher',
  ADAPTER: '🔌 Adapter',
  CABLE: '🔗 Kabel',
  WHITEBOARD: '📋 Whiteboards',
  PINBOARD: '📌 Pinnwände',
  FLIPCHART: '📊 Flipcharts',
  CHAIR: '🪑 Stühle',
  BUSINESS_PRINTS: '📄 Geschäftsausdrucke',
  OFFICE_MISC: '📦 Büro-Sonstiges'
}

export default function AdminProductsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editedRole, setEditedRole] = useState<'IT_SUPPORT' | 'EMPFANG'>('IT_SUPPORT')

  // Check if user is admin
  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/catalog')
    }
  }, [session, router])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      } else {
        toast.error('Fehler beim Laden der Produkte')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Fehler beim Laden der Produkte')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product.id)
    setEditedRole(product.responsibleRole)
  }

  const handleSave = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responsibleRole: editedRole
        }),
      })

      if (response.ok) {
        toast.success('Produktverantwortlichkeit aktualisiert')
        setEditingProduct(null)
        fetchProducts() // Refresh the list
      } else {
        toast.error('Fehler beim Aktualisieren')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Fehler beim Aktualisieren')
    }
  }

  const handleCancel = () => {
    setEditingProduct(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Lade Produkte...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📦 Produktverwaltung</h1>
        <p className="text-gray-700 mt-2 font-medium">
          Verwalten Sie die Verantwortlichkeiten für alle Produkte
        </p>
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id} className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_LABELS[product.category as keyof typeof CATEGORY_LABELS] || product.category}
                    </Badge>
                    {product.requiresApproval && (
                      <Badge variant="destructive" className="text-xs">
                        ⚠️ Genehmigung erforderlich
                      </Badge>
                    )}
                  </div>
                  
                  {product.model && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Modell:</span> {product.model}
                    </p>
                  )}
                  
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  )}
                  
                  {product.price && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Preis:</span> {product.price.toFixed(0)} €
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {editingProduct === product.id ? (
                    <div className="flex items-center gap-2">
                      <Select value={editedRole} onValueChange={(value: 'IT_SUPPORT' | 'EMPFANG') => setEditedRole(value)}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IT_SUPPORT">💻 IT-Support</SelectItem>
                          <SelectItem value="EMPFANG">🏢 Empfang</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={() => handleSave(product.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`text-sm px-3 py-1 ${
                          product.responsibleRole === 'IT_SUPPORT' 
                            ? 'bg-blue-100 text-blue-800 border-blue-200' 
                            : 'bg-purple-100 text-purple-800 border-purple-200'
                        }`}
                      >
                        {RESPONSIBLE_ROLE_LABELS[product.responsibleRole]}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">📋 Verantwortlichkeiten:</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-1">💻 IT-Support ist zuständig für:</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Webcams, Headsets, Mäuse, Tastaturen</li>
              <li>• Adapter, Kabel, Druckertoner</li>
              <li>• Desktop-Lautsprecher</li>
              <li>• Alle IT-Hardware und -Zubehör</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-purple-800 mb-1">🏢 Empfang ist zuständig für:</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Whiteboards, Pinnwände, Flipcharts</li>
              <li>• Bürostühle</li>
              <li>• Geschäftsausdrucke & Briefumschläge</li>
              <li>• Büroausstattung und -material</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
