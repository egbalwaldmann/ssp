'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { CreditCard, User, Mail, Phone, Briefcase, Building, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function BusinessCardsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: session?.user?.name || '',
    jobTitle: '',
    department: session?.user?.department || '',
    email: session?.user?.email || '',
    phone: '',
    mobile: '',
    quantity: '250',
    specialNotes: '',
    justification: ''
  })

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.jobTitle || !formData.email) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus')
      return
    }

    if (!formData.justification.trim()) {
      toast.error('Begründung ist erforderlich')
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        items: [],
        costCenter: session?.user?.costCenter || 'CC-001',
        specialRequest: 'Visitenkarten-Bestellung',
        justification: formData.justification,
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

  const isStep1Valid = formData.fullName && formData.jobTitle && formData.email && formData.department
  const isStep2Valid = formData.justification.trim().length > 0

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🪪 Visitenkarten bestellen</h1>
        <p className="text-gray-600 text-lg">
          Professionelle Visitenkarten im Corporate Design
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
          <span className="font-bold">1</span>
          <span className="text-sm font-medium">Kontaktdaten</span>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400" />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
          <span className="font-bold">2</span>
          <span className="text-sm font-medium">Begründung</span>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400" />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
          <span className="font-bold">3</span>
          <span className="text-sm font-medium">Überprüfen</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div>
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">👤 Ihre Kontaktdaten</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Diese Informationen erscheinen auf Ihren Visitenkarten
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <User className="h-4 w-4" />
                    Vollständiger Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Max Mustermann"
                    className="text-lg py-6"
                  />
                </div>

                <div>
                  <label htmlFor="jobTitle" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <Briefcase className="h-4 w-4" />
                    Berufsbezeichnung <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="z.B. Referent, Sachbearbeiter, Abteilungsleiter"
                    className="text-lg py-6"
                  />
                </div>

                <div>
                  <label htmlFor="department" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <Building className="h-4 w-4" />
                    Abteilung <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="z.B. Marketing, IT, Verwaltung"
                    className="text-lg py-6"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <Mail className="h-4 w-4" />
                    E-Mail-Adresse <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="max.mustermann@bund.de"
                    className="text-lg py-6"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                      <Phone className="h-4 w-4" />
                      Festnetz
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+49 30 12345-678"
                      className="text-lg py-6"
                    />
                  </div>

                  <div>
                    <label htmlFor="mobile" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                      <Phone className="h-4 w-4" />
                      Mobil
                    </label>
                    <Input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="+49 170 1234567"
                      className="text-lg py-6"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Link href="/catalog" className="flex-1">
                    <Button variant="outline" className="w-full py-6">
                      Abbrechen
                    </Button>
                  </Link>
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!isStep1Valid}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 py-6"
                  >
                    Weiter →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">📝 Begründung</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Visitenkarten-Bestellungen benötigen eine Genehmigung
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label htmlFor="quantity" className="text-sm font-semibold text-gray-900 mb-2 block">
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
                    className="text-lg py-6"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Standard: 250 Stück (Min: 50, Max: 1000, Schritte: 50)
                  </p>
                </div>

                <div>
                  <label htmlFor="justification" className="text-sm font-semibold text-gray-900 mb-2 block">
                    Warum benötigen Sie diese Visitenkarten? <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="justification"
                    name="justification"
                    value={formData.justification}
                    onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                    placeholder="z.B. Neue Stelle, Alte Karten aufgebraucht, Kontaktdaten geändert..."
                    rows={5}
                    className="text-base"
                  />
                </div>

                <div>
                  <label htmlFor="specialNotes" className="text-sm font-semibold text-gray-900 mb-2 block">
                    💬 Besondere Hinweise (Optional)
                  </label>
                  <Textarea
                    id="specialNotes"
                    name="specialNotes"
                    value={formData.specialNotes}
                    onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                    placeholder="z.B. Besondere Formatwünsche, Logo-Varianten, etc."
                    rows={3}
                    className="text-base"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-6"
                  >
                    ← Zurück
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={!isStep2Valid}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 py-6"
                  >
                    Weiter →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">✅ Überprüfen & Bestellen</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Bitte überprüfen Sie Ihre Angaben vor der Bestellung
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Kontaktdaten</p>
                    <div className="space-y-2">
                      <p className="font-bold text-lg text-gray-900">{formData.fullName}</p>
                      <p className="text-gray-700">{formData.jobTitle}</p>
                      <p className="text-gray-600">{formData.department}</p>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Kontakt</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700">{formData.email}</p>
                      {formData.phone && <p className="text-gray-700">Tel: {formData.phone}</p>}
                      {formData.mobile && <p className="text-gray-700">Mobil: {formData.mobile}</p>}
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Menge</p>
                    <p className="font-bold text-xl text-blue-600">{formData.quantity} Stück</p>
                  </div>

                  {formData.justification && (
                    <div className="border-t pt-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Begründung</p>
                      <p className="text-sm text-gray-700">{formData.justification}</p>
                    </div>
                  )}

                  {formData.specialNotes && (
                    <div className="border-t pt-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Besondere Hinweise</p>
                      <p className="text-sm text-gray-700">{formData.specialNotes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 py-6"
                  >
                    ← Zurück
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 py-6 text-lg font-bold"
                  >
                    {isSubmitting ? '⏳ Wird eingereicht...' : '✅ Jetzt bestellen'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Live Preview */}
        <div className="lg:sticky lg:top-6 h-fit">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-xl">👁️ Live-Vorschau</CardTitle>
              <p className="text-sm text-gray-600">So wird Ihre Visitenkarte aussehen</p>
            </CardHeader>
            <CardContent>
              {/* Business Card Preview */}
              <div className="bg-white rounded-lg shadow-xl p-8 space-y-4 border-l-4 border-blue-600">
                <div className="space-y-2">
                  <h2 className="font-bold text-2xl text-gray-900">
                    {formData.fullName || 'Ihr Name'}
                  </h2>
                  <p className="text-lg text-gray-700 font-medium">
                    {formData.jobTitle || 'Ihre Berufsbezeichnung'}
                  </p>
                  <p className="text-base text-gray-600">
                    {formData.department || 'Ihre Abteilung'}
                  </p>
                </div>

                <div className="border-t-2 border-gray-200 pt-4 space-y-2 text-sm">
                  <p className="text-gray-700 font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {formData.email || 'ihre.email@bund.de'}
                  </p>
                  {formData.phone && (
                    <p className="text-gray-700 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {formData.phone}
                    </p>
                  )}
                  {formData.mobile && (
                    <p className="text-gray-700 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {formData.mobile}
                    </p>
                  )}
                </div>

                <div className="pt-4 text-xs text-gray-400 border-t">
                  <p>Bundesrepublik Deutschland</p>
                  <p>Corporate Design 2025</p>
                </div>
              </div>

              <p className="text-xs text-center text-gray-500 mt-4">
                Dies ist eine vereinfachte Vorschau. Das finale Design wird professionell im Corporate Design gestaltet.
              </p>
            </CardContent>
          </Card>

          {/* Info Box */}
          <Card className="mt-4 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <span>ℹ️</span>
                Wichtige Informationen
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Visitenkarten werden im Corporate Design der Behörde gedruckt</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Lieferzeit: ca. 5-7 Werktage nach Genehmigung</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Standard-Menge: 250 Stück</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Genehmigung durch Abteilungsleitung erforderlich</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

