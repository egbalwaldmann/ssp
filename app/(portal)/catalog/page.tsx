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
const getProductEmoji = (category: string): string => {
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
  
  return categoryEmojis[category] || '📦'
}

const CATEGORIES = [
  { value: 'ALL', label: 'Alle Produkte' },
  { value: 'REQUIRES_APPROVAL', label: '🔒 Genehmigung erforderlich' },
  { value: 'NO_APPROVAL', label: '✅ Keine Genehmigung' },
  { value: 'BUSINESS_CARDS', label: '💳 Visitenkarten' },
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'name-reverse' | 'price-low' | 'price-high'>('name')
  const [imageFail, setImageFail] = useState<Record<string, boolean>>({})
  const { addItem } = useCart()
  
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, selectedCategories, searchQuery, sortBy])

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

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => {
        // Handle special approval categories
        if (selectedCategories.includes('REQUIRES_APPROVAL')) {
          return p.requiresApproval === true
        }
        if (selectedCategories.includes('NO_APPROVAL')) {
          return p.requiresApproval === false
        }
        // Handle business cards category
        if (selectedCategories.includes('BUSINESS_CARDS')) {
          return p.name.toLowerCase().includes('visitenkarte') || 
                 p.name.toLowerCase().includes('business card')
        }
        // Handle regular categories
        return selectedCategories.includes(p.category)
      })
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

    // Sort products
    if (sortBy === 'name') {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))
      console.log('🔤 Sorting A-Z:', filtered.slice(0, 3).map(p => p.name))
    } else if (sortBy === 'name-reverse') {
      filtered = filtered.sort((a, b) => b.name.localeCompare(a.name))
      console.log('🔤 Sorting Z-A:', filtered.slice(0, 3).map(p => p.name))
    } else if (sortBy === 'price-low') {
      filtered = filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortBy === 'price-high') {
      filtered = filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
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
    <div className="flex gap-6">
      {/* Left Sidebar - Category Filter (Jira-Style) */}
      <aside className="w-64 shrink-0">
        <div className="sticky top-6 space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">📂 Kategorien</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-0">
              {CATEGORIES.filter(cat => cat.value !== 'ALL').map((cat) => {
                const isSelected = selectedCategories.includes(cat.value)
                const count = cat.value === 'REQUIRES_APPROVAL' 
                  ? products.filter(p => p.requiresApproval === true).length
                  : cat.value === 'NO_APPROVAL'
                  ? products.filter(p => p.requiresApproval === false).length
                  : cat.value === 'BUSINESS_CARDS'
                  ? products.filter(p => p.name.toLowerCase().includes('visitenkarte') || p.name.toLowerCase().includes('business card')).length
                  : products.filter(p => p.category === cat.value).length
                
                return (
                  <button
                    key={cat.value}
                    onClick={() => toggleCategory(cat.value)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors
                      ${isSelected 
                        ? 'bg-[var(--jira-blue-light)] text-[var(--jira-blue)] font-medium border-l-4 border-[var(--jira-blue)]' 
                        : 'hover:bg-gray-50 text-gray-700 border-l-4 border-transparent'
                      }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-xs ${isSelected ? 'text-[var(--jira-blue)]' : 'text-gray-400'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </CardContent>
          </Card>
          
          {selectedCategories.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategories([])}
              className="w-full text-sm"
            >
              Alle Filter zurücksetzen
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--jira-gray-900)]">🛍️ Produktkatalog</h1>
          <p className="text-[var(--jira-gray-500)] mt-1">
            IT-Equipment und Büromaterial durchsuchen und bestellen
          </p>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="product-search"
              name="product-search"
              placeholder="Produkte suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[220px] bg-white border-2 border-gray-300 font-semibold text-gray-900">
              <SelectValue placeholder="Sortieren" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="name" className="font-medium text-gray-800">
                🔤 Alphabetisch (A-Z)
              </SelectItem>
              <SelectItem value="name-reverse" className="font-medium text-gray-800">
                🔤 Alphabetisch (Z-A)
              </SelectItem>
              <SelectItem value="price-low" className="font-medium text-gray-800">
                💰 Preis aufsteigend
              </SelectItem>
              <SelectItem value="price-high" className="font-medium text-gray-800">
                💰 Preis absteigend
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between text-sm text-[var(--jira-gray-500)]">
          <span>{filteredProducts.length} von {products.length} Produkten</span>
          {selectedCategories.length > 0 && (
            <span className="text-[var(--jira-blue)] font-medium">
              {selectedCategories.length} {selectedCategories.length === 1 ? 'Filter' : 'Filter'} aktiv
            </span>
          )}
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
            <Card key={product.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
              <CardHeader className="flex-1">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {product.imageUrl && !imageFail[product.id] ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={() => setImageFail((prev) => ({ ...prev, [product.id]: true }))}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <div className="text-9xl">
                        {getProductEmoji(product.category)}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-3 flex-1">
                  <div className="space-y-2">
                    <CardTitle className="text-lg font-bold line-clamp-2 text-gray-900 leading-tight">{product.name}</CardTitle>
                    {product.requiresApproval && (
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 border-orange-200 w-fit">
                        ⚠️ Genehmigung erforderlich
                      </Badge>
                    )}
                  </div>
                  {product.model && (
                    <p className="text-sm text-gray-700 font-medium">Modell: {product.model}</p>
                  )}
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-2">
                {product.price && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-blue-600">{product.price.toFixed(0)} €</span>
                    <span className="text-sm text-gray-500">pro Stück</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2">
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
    </div>
  )
}

