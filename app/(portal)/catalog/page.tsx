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

const CATEGORIES = [
  { value: 'ALL', label: 'All Products' },
  { value: 'WEBCAM', label: 'Webcams' },
  { value: 'HEADSET', label: 'Headsets' },
  { value: 'MOUSE', label: 'Mice' },
  { value: 'KEYBOARD', label: 'Keyboards' },
  { value: 'PRINTER_TONER', label: 'Printer Toner' },
  { value: 'SPEAKERS', label: 'Speakers' },
  { value: 'ADAPTER', label: 'Adapters' },
  { value: 'CABLE', label: 'Cables' },
  { value: 'WHITEBOARD', label: 'Whiteboards' },
  { value: 'PINBOARD', label: 'Pinboards' },
  { value: 'FLIPCHART', label: 'Flipcharts' },
  { value: 'CHAIR', label: 'Chairs' },
  { value: 'BUSINESS_PRINTS', label: 'Business Prints' },
  { value: 'OFFICE_MISC', label: 'Office Misc' },
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
      toast.error('Failed to load products')
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
    toast.success(`${product.name} added to cart`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
        <p className="text-gray-600 mt-2">
          Browse and order IT equipment and office supplies
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Category" />
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
        Showing {filteredProducts.length} of {products.length} products
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
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
                      <Package className="h-16 w-16 text-gray-300" />
                      <p className="text-gray-400 text-sm mt-2 text-center px-4">
                        {product.name}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2 text-gray-900">{product.name}</CardTitle>
                    {product.requiresApproval && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Genehmigung
                      </Badge>
                    )}
                  </div>
                  {product.model && (
                    <p className="text-sm text-gray-600">Modell: {product.model}</p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                {product.description && (
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {product.description}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleAddToCart(product)}
                  className="w-full"
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

