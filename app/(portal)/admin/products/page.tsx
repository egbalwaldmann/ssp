'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Package, Edit, Save, X, Plus, Trash2 } from 'lucide-react'

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
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({})
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Check if user has permission (all roles except REQUESTER)
  useEffect(() => {
    if (!session || session.user?.role === 'REQUESTER') {
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
    setEditedProduct({
      name: product.name,
      description: product.description || '',
      category: product.category,
      model: product.model || '',
      price: product.price || 0,
      requiresApproval: product.requiresApproval,
      responsibleRole: product.responsibleRole
    })
  }

  const handleSave = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProduct),
      })

      if (response.ok) {
        toast.success('Produkt aktualisiert')
        setEditingProduct(null)
        setEditedProduct({})
        fetchProducts()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Fehler beim Aktualisieren')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Fehler beim Aktualisieren')
    }
  }

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Möchten Sie das Produkt "${productName}" wirklich löschen?`)) {
      return
    }

    setIsDeleting(productId)
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Produkt gelöscht')
        fetchProducts()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Fehler beim Löschen')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Fehler beim Löschen')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleCancel = () => {
    setEditingProduct(null)
    setEditedProduct({})
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📦 Produktverwaltung</h1>
          <p className="text-gray-700 mt-2 font-medium">
            Verwalten Sie alle Produkte - Erstellen, Bearbeiten und Löschen
          </p>
        </div>
        <Button onClick={() => router.push('/admin/create-product')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Neues Produkt
        </Button>
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id} className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              {editingProduct === product.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <Input
                        value={editedProduct.name || ''}
                        onChange={(e) => setEditedProduct({...editedProduct, name: e.target.value})}
                        placeholder="Produktname"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                      <Select 
                        value={editedProduct.category || ''} 
                        onValueChange={(value) => setEditedProduct({...editedProduct, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategorie wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Modell</label>
                      <Input
                        value={editedProduct.model || ''}
                        onChange={(e) => setEditedProduct({...editedProduct, model: e.target.value})}
                        placeholder="Modell"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preis (€)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editedProduct.price || ''}
                        onChange={(e) => setEditedProduct({...editedProduct, price: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Verantwortliche Rolle</label>
                      <Select 
                        value={editedProduct.responsibleRole || ''} 
                        onValueChange={(value: 'IT_SUPPORT' | 'EMPFANG') => setEditedProduct({...editedProduct, responsibleRole: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Rolle wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IT_SUPPORT">💻 IT-Support</SelectItem>
                          <SelectItem value="EMPFANG">🏢 Empfang</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requiresApproval"
                        checked={editedProduct.requiresApproval || false}
                        onChange={(e) => setEditedProduct({...editedProduct, requiresApproval: e.target.checked})}
                        className="rounded"
                      />
                      <label htmlFor="requiresApproval" className="text-sm font-medium text-gray-700">
                        Genehmigung erforderlich
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                    <Textarea
                      value={editedProduct.description || ''}
                      onChange={(e) => setEditedProduct({...editedProduct, description: e.target.value})}
                      placeholder="Produktbeschreibung"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSave(product.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Speichern
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Abbrechen
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
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
                        <span className="font-medium">Preis:</span> {product.price.toFixed(2)} €
                      </p>
                    )}
                  </div>

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
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={isDeleting === product.id}
                    >
                      {isDeleting === product.id ? (
                        <Package className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Produkte gefunden</h3>
          <p className="text-gray-600 mb-4">Erstellen Sie Ihr erstes Produkt, um zu beginnen.</p>
          <Button onClick={() => router.push('/admin/create-product')}>
            <Plus className="h-4 w-4 mr-2" />
            Neues Produkt erstellen
          </Button>
        </div>
      )}
    </div>
  )
}