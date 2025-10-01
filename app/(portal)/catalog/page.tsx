'use client'

import { useState, useEffect } from 'react'
import { Product, Category } from '@prisma/client'
import { useCart } from '@/lib/store/cart-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Search, ShoppingCart, Package } from 'lucide-react'

// Produkt-spezifische Emojis
const getProductEmoji = (category: string, name: string): string => {
  const categoryEmojis: Record<string, string> = {
    'WEBCAM': '📹',
    'HEADSET': '🎧',
    'MOUSE': '🖱️',
    'KEYBOARD': '⌨️',
    'PRINTER_TONER': '🖨️',
    'SPEAKERS': '🔊',
    'ADAPTER': '🔌',
    'CABLE': '🔗',
    'WHITEBOARD': '📋',
    'PINBOARD': '📌',
    'FLIPCHART': '📊',
    'CHAIR': '🪑',
    'BUSINESS_PRINTS': '📄',
    'OFFICE_MISC': '📦'
  }
  
  // Spezielle Emojis für bestimmte Produkte
  if (name.toLowerCase().includes('webcam')) return '📹'
  if (name.toLowerCase().includes('headset') || name.toLowerCase().includes('jabra')) return '🎧'
  if (name.toLowerCase().includes('mouse') || name.toLowerCase().includes('maus')) return '🖱️'
  if (name.toLowerCase().includes('keyboard') || name.toLowerCase().includes('tastatur')) return '⌨️'
  if (name.toLowerCase().includes('toner')) return '🖨️'
  if (name.toLowerCase().includes('speaker') || name.toLowerCase().includes('lautsprecher')) return '🔊'
  if (name.toLowerCase().includes('adapter')) return '🔌'
  if (name.toLowerCase().includes('cable') || name.toLowerCase().includes('kabel')) return '🔗'
  if (name.toLowerCase().includes('whiteboard')) return '📋'
  if (name.toLowerCase().includes('pinboard') || name.toLowerCase().includes('pinnwand')) return '📌'
  if (name.toLowerCase().includes('flipchart')) return '📊'
  if (name.toLowerCase().includes('chair') || name.toLowerCase().includes('stuhl')) return '🪑'
  if (name.toLowerCase().includes('business') || name.toLowerCase().includes('geschäft')) return '📄'
  
  return categoryEmojis[category] || '📦'
}

const CATEGORIES = [
  { value: 'ALL', label: 'Alle Produkte' },
  { value: 'WEBCAM', label: 'Webcams' },
  { value: 'HEADSET', label: 'Headsets' },
  { value: 'MOUSE', label: 'Mäuse' },
  { value: 'KEYBOARD', label: 'Tastaturen' },
  { value: 'PRINTER_TONER', label: 'Druckertoner' },
  { value: 'SPEAKERS', label: 'Lautsprecher' },
  { value: 'ADAPTER', label: 'Adapter' },
  { value: 'CABLE', label: 'Kabel' },
  { value: 'WHITEBOARD', label: 'Whiteboards' },
  { value: 'PINBOARD', label: 'Pinnwände' },
  { value: 'FLIPCHART', label: 'Flipcharts' },
  { value: 'CHAIR', label: 'Stühle' },
  { value: 'BUSINESS_PRINTS', label: 'Geschäftsausdrucke' },
  { value: 'OFFICE_MISC', label: 'Büro-Sonstiges' },
]

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [imageFail, setImageFail] = useState<Record<string, boolean>>({})
  const { addItem } = useCart()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, selectedCategory, searchQuery])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
        setFilteredProducts(data)
      }
    } catch (error) {
      toast.error('Produkte konnten nicht geladen werden')
    } finally {
      setIsLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.model?.toLowerCase().includes(query)
      )
    }

    setFilteredProducts(filtered)
  }

  const handleAddToCart = (product: Product) => {
    addItem(product)
    toast.success(`${product.name} zum Warenkorb hinzugefügt`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Produkte werden geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🛍️ Produktkatalog</h1>
        <p className="text-gray-700 mt-2 font-medium">
          IT-Equipment und Büromaterial durchsuchen und bestellen
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Produkte suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-gray-600">
        {filteredProducts.length} von {products.length} Produkten angezeigt
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Produkte gefunden</h3>
          <p className="text-gray-600">Versuchen Sie, Ihre Such- oder Filterkriterien anzupassen</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {product.imageUrl && !imageFail[product.id] ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={() => setImageFail((prev) => ({ ...prev, [product.id]: true }))}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-6xl mb-2">
                        {getProductEmoji(product.category, product.name)}
                      </div>
                      <p className="text-gray-600 text-sm mt-2 text-center px-4 font-medium">
                        {product.name}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-bold line-clamp-2 text-gray-900 leading-tight">{product.name}</CardTitle>
                    {product.requiresApproval && (
                      <Badge variant="secondary" className="text-xs shrink-0 bg-orange-100 text-orange-800 border-orange-200">
                        ⚠️ Genehmigung
                      </Badge>
                    )}
                  </div>
                  {product.model && (
                    <p className="text-sm text-gray-700 font-medium">Modell: {product.model}</p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                {product.description && (
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>
                )}
              </CardContent>
              <CardFooter className="pt-4">
                <Button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  In Warenkorb
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

