'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { CreditCard, User, Mail, Phone, Briefcase, Building } from 'lucide-react'

export default function BusinessCardsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: session?.user?.name || '',
    jobTitle: '',
    department: session?.user?.department || '',
    email: session?.user?.email || '',
    phone: '',
    mobile: '',
    quantity: '250',
    specialNotes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fullName || !formData.jobTitle || !formData.email) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus')
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        items: [],
        costCenter: session?.user?.costCenter || 'CC-001',
        specialRequest: 'Visitenkarten-Bestellung',
        justification: `Visitenkarten für ${formData.fullName}`,
        businessCard: {
          fullName: formData.fullName,
          jobTitle: formData.jobTitle,
          department: formData.department,
          email: formData.email,
          phone: formData.phone || null,
          mobile: formData.mobile || null,
          quantity: parseInt(formData.quantity),
          specialNotes: formData.specialNotes || null
        }
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (res.ok) {
        const order = await res.json()
        toast.success(`🎉 Visitenkarten-Bestellung ${order.orderNumber} erfolgreich eingereicht!`)
        router.push('/orders')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Bestellung konnte nicht eingereicht werden')
      }
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🪪 Visitenkarten bestellen</h1>
        <p className="text-gray-700 mt-2 font-medium">
          Bestellen Sie professionelle Visitenkarten für Ihre Abteilung
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Visitenkarten-Informationen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4" />
                  Vollständiger Name *
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Max Mustermann"
                  required
                  className="font-medium"
                />
              </div>

              <div>
                <label htmlFor="jobTitle" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="h-4 w-4" />
                  Berufsbezeichnung *
                </label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="z.B. Referent, Sachbearbeiter"
                  required
                  className="font-medium"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="department" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Building className="h-4 w-4" />
                  Abteilung *
                </label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="z.B. Marketing, IT"
                  required
                  className="font-medium"
                />
              </div>

              <div>
                <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4" />
                  E-Mail *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="max.mustermann@bund.de"
                  required
                  className="font-medium"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4" />
                  Festnetz (Optional)
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+49 30 12345-678"
                  className="font-medium"
                />
              </div>

              <div>
                <label htmlFor="mobile" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4" />
                  Mobil (Optional)
                </label>
                <Input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="+49 170 1234567"
                  className="font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="quantity" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                📦 Anzahl Visitenkarten
              </label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="50"
                max="1000"
                step="50"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="font-medium"
              />
              <p className="text-sm text-gray-500 mt-1">
                Standard: 250 Stück (Min: 50, Max: 1000)
              </p>
            </div>

            <div>
              <label htmlFor="specialNotes" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                💬 Besondere Hinweise (Optional)
              </label>
              <Textarea
                id="specialNotes"
                name="specialNotes"
                value={formData.specialNotes}
                onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                placeholder="z.B. Besondere Formatwünsche, Logo-Varianten, etc."
                rows={3}
                className="font-medium"
              />
            </div>

            {/* Preview */}
            <Card className="bg-gray-50 border-2 border-dashed">
              <CardHeader>
                <CardTitle className="text-sm">📋 Vorschau</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-bold text-lg">{formData.fullName || 'Ihr Name'}</p>
                <p className="text-gray-700">{formData.jobTitle || 'Ihre Berufsbezeichnung'}</p>
                <p className="text-gray-600">{formData.department || 'Ihre Abteilung'}</p>
                <div className="border-t pt-2 mt-2 space-y-1">
                  <p className="text-gray-700">{formData.email || 'ihre.email@bund.de'}</p>
                  {formData.phone && <p className="text-gray-700">Tel: {formData.phone}</p>}
                  {formData.mobile && <p className="text-gray-700">Mobil: {formData.mobile}</p>}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Dies ist nur eine vereinfachte Vorschau. Das finale Design wird professionell gestaltet.
                </p>
              </CardContent>
            </Card>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Hinweise</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Visitenkarten werden im Corporate Design der Behörde gedruckt</li>
                <li>• Lieferzeit: ca. 5-7 Werktage nach Genehmigung</li>
                <li>• Standard-Menge: 250 Stück</li>
                <li>• Genehmigung durch Abteilungsleitung erforderlich</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
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
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Wird eingereicht...' : '📤 Bestellung einreichen'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

