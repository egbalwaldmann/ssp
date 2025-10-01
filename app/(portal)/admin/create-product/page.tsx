'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Package, Plus } from 'lucide-react'

const CATEGORIES = [
  { value: 'WEBCAM', label: '📹 Webcams' },
  { value: 'HEADSET', label: '🎧 Headsets' },
  { value: 'MOUSE', label: '🖱️ Mäuse' },
  { value: 'KEYBOARD', label: '⌨️ Tastaturen' },
  { value: 'PRINTER_TONER', label: '🖨️ Druckertoner' },
  { value: 'SPEAKERS', label: '🔊 Lautsprecher' },
  { value: 'ADAPTER', label: '🔌 Adapter' },
  { value: 'CABLE', label: '🔗 Kabel' },
  { value: 'WHITEBOARD', label: '📋 Whiteboards' },
  { value: 'PINBOARD', label: '📌 Pinnwände' },
  { value: 'FLIPCHART', label: '📊 Flipcharts' },
  { value: 'CHAIR', label: '🪑 Stühle' },
  { value: 'BUSINESS_PRINTS', label: '📄 Geschäftsausdrucke' },
  { value: 'OFFICE_MISC', label: '📦 Büro-Sonstiges' }
]

export default function CreateProductPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [product, setProduct] = useState({
    name: '',
    description: '',
    category: '',
    model: '',
    price: '',
    requiresApproval: false
  })

  // Check if user has permission
  useEffect(() => {
    if (!session || !['IT_SUPPORT', 'EMPFANG', 'ADMIN'].includes(session.user?.role || '')) {
      router.push('/catalog')
    }
  }, [session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!product.name || !product.category) {
      toast.error('Bitte Name und Kategorie ausfüllen')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          price: product.price ? parseFloat(product.price) : null,
          responsibleRole: session?.user?.role === 'IT_SUPPORT' ? 'IT_SUPPORT' : 'EMPFANG'
        }),
      })

      if (response.ok) {
        toast.success('Produkt erfolgreich erstellt!')
        router.push('/catalog')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Fehler beim Erstellen des Produkts')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Fehler beim Erstellen des Produkts')
    } finally {
      setIsLoading(false)
    }
  }

  const getResponsibleRole = () => {
    if (session?.user?.role === 'IT_SUPPORT') return '💻 IT-Support'
    if (session?.user?.role === 'EMPFANG') return '🏢 Empfang'
    return '⚙️ Admin'
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📦 Neues Produkt erstellen</h1>
        <p className="text-gray-700 mt-2 font-medium">
          Verantwortlich: {getResponsibleRole()}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Produktdetails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Produktname *</label>
              <Input
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                placeholder="z.B. Logitech C270 HD-Webcam"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Kategorie *</label>
              <Select value={product.category} onValueChange={(value) => setProduct({ ...product, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Modell</label>
              <Input
                value={product.model}
                onChange={(e) => setProduct({ ...product, model: e.target.value })}
                placeholder="z.B. C270"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Beschreibung</label>
              <Textarea
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                placeholder="Beschreibung des Produkts..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Preis (€)</label>
              <Input
                type="number"
                step="0.01"
                value={product.price}
                onChange={(e) => setProduct({ ...product, price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requiresApproval"
                checked={product.requiresApproval}
                onChange={(e) => setProduct({ ...product, requiresApproval: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="requiresApproval" className="text-sm font-medium">
                Genehmigung erforderlich
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/catalog')}
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Package className="h-4 w-4 mr-2 animate-spin" />
                    Erstelle...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Produkt erstellen
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Hinweise:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Das Produkt wird automatisch Ihrer Verantwortlichkeit zugeordnet</li>
          <li>• Sie können später die Verantwortlichkeit in der Produktverwaltung ändern</li>
          <li>• Produkte mit Genehmigungspflicht benötigen eine Führungskraft-Genehmigung</li>
        </ul>
      </div>
    </div>
  )
}
