import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { robustAuth } from '@/lib/auth-robust'
import { Category } from '@prisma/client'

// Fallback-Produktdaten für den Fall, dass die Datenbank nicht verfügbar ist
const getFallbackProducts = () => {
  return [
    {
      id: 'demo-1',
      name: 'Logitech C270 HD-Webcam',
      category: Category.WEBCAM,
      model: 'C270',
      imageUrl: '/products/webcam-logitech-c270.jpg',
      description: 'HD-Webcam für Videotelefonie und Konferenzen',
      requiresApproval: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'demo-2',
      name: 'Jabra Evolve2 65 (Bluetooth)',
      category: Category.HEADSET,
      model: 'Evolve2 65',
      imageUrl: '/products/headset-jabra-evolve2-65.jpg',
      description: 'Kabelloses Bluetooth-Headset mit aktiver Geräuschunterdrückung',
      requiresApproval: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'demo-3',
      name: 'Jabra Evolve2 40 (Kabelgebunden)',
      category: Category.HEADSET,
      model: 'Evolve2 40',
      imageUrl: '/products/headset-jabra-evolve2-40.jpg',
      description: 'Kabelgebundenes USB-Headset mit überlegener Klangqualität',
      requiresApproval: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'demo-4',
      name: 'Cherry GENTIX Silent Maus',
      category: Category.MOUSE,
      model: 'GENTIX Silent',
      imageUrl: '/products/mouse-cherry-gentix.jpg',
      description: 'Leise Maus für ruhige Büroumgebungen',
      requiresApproval: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'demo-5',
      name: 'Logitech Lift Ergonomische Maus',
      category: Category.MOUSE,
      model: 'Lift',
      imageUrl: '/products/mouse-logitech-lift.jpg',
      description: 'Ergonomische vertikale Maus für komfortable Nutzung',
      requiresApproval: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'demo-6',
      name: 'Cherry Stream Tastatur',
      category: Category.KEYBOARD,
      model: 'JK-8500',
      imageUrl: '/products/keyboard-cherry-stream.jpg',
      description: 'Professionelle Tastatur mit flachen Tasten',
      requiresApproval: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'demo-7',
      name: 'Verbatim USB-C zu HDMI Adapter',
      category: Category.ADAPTER,
      model: 'USB-C-HDMI',
      imageUrl: '/products/adapter-usb-c-hdmi.jpg',
      description: 'Verbinden Sie Ihr USB-C-Gerät mit HDMI-Displays',
      requiresApproval: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'demo-8',
      name: 'ROLINE HDMI Kabel High Speed',
      category: Category.CABLE,
      model: 'HDMI-2M',
      imageUrl: '/products/cable-hdmi.jpg',
      description: 'Hochgeschwindigkeits-HDMI-Kabel für 4K-Displays',
      requiresApproval: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'demo-9',
      name: 'Druckertoner',
      category: Category.PRINTER_TONER,
      model: 'Toner-001',
      imageUrl: '/products/toner.jpg',
      description: 'Verschiedene Tonerkartuschen für alle Bürodrucker verfügbar',
      requiresApproval: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'demo-10',
      name: 'Desktop-Lautsprecher',
      category: Category.SPEAKERS,
      model: 'Speaker-001',
      imageUrl: '/products/speakers.jpg',
      description: 'Kompakte Desktop-Lautsprecher für Multimedia',
      requiresApproval: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'demo-11',
      name: 'Whiteboard',
      category: Category.WHITEBOARD,
      model: 'WB-001',
      imageUrl: '/products/whiteboard.jpg',
      description: 'Verschiedene Größen verfügbar - in Sonderwünschen angeben',
      requiresApproval: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'demo-12',
      name: 'Pinnwand',
      category: Category.PINBOARD,
      model: 'PB-001',
      imageUrl: '/products/pinboard.jpg',
      description: 'Korkpinnwand für Mitteilungen und Dokumente',
      requiresApproval: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'demo-13',
      name: 'Flipchart-Papier',
      category: Category.FLIPCHART,
      model: 'FC-001',
      imageUrl: '/products/flipchart.jpg',
      description: 'Flipchart-Papierblöcke für Meetings und Präsentationen',
      requiresApproval: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'demo-14',
      name: 'Bürostuhl',
      category: Category.CHAIR,
      model: 'Chair-001',
      imageUrl: '/products/chair.jpg',
      description: 'Ergonomischer Bürostuhl - erfordert Manager-Genehmigung',
      requiresApproval: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'demo-15',
      name: 'Geschäftsausdrucke & Briefumschläge',
      category: Category.BUSINESS_PRINTS,
      model: 'BP-001',
      imageUrl: '/products/business-prints.jpg',
      description: 'Visitenkarten, Briefköpfe und Briefumschläge',
      requiresApproval: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    console.log('🛍️ Fetching products with filters:', { category, search })

    // Check database health first
    const dbHealthy = await robustAuth.checkDatabaseHealth()
    
    let products
    
    if (dbHealthy) {
      try {
        console.log('📊 Database healthy, fetching from database')
        
        const where: any = {
          isActive: true
        }

        if (category && category !== 'ALL') {
          where.category = category
        }

        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { model: { contains: search, mode: 'insensitive' } }
          ]
        }

        products = await prisma.product.findMany({
          where,
          orderBy: {
            name: 'asc'
          }
        })
        
        console.log(`✅ Fetched ${products.length} products from database`)
      } catch (error) {
        console.warn('⚠️ Database query failed, using fallback products:', error)
        products = getFallbackProducts()
      }
    } else {
      console.warn('⚠️ Database unhealthy, using fallback products')
      products = getFallbackProducts()
    }

    // Apply client-side filtering for fallback products
    if (!dbHealthy || products === getFallbackProducts()) {
      let filteredProducts = products
      
      if (category && category !== 'ALL') {
        filteredProducts = filteredProducts.filter(p => p.category === category)
      }
      
      if (search) {
        const searchLower = search.toLowerCase()
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          (p.description && p.description.toLowerCase().includes(searchLower)) ||
          (p.model && p.model.toLowerCase().includes(searchLower))
        )
      }
      
      products = filteredProducts
    }

    console.log(`📦 Returning ${products.length} products`)
    return NextResponse.json(products)
  } catch (error) {
    console.error('❌ Error fetching products:', error)
    
    // Return fallback products even on error
    console.log('🔄 Using fallback products due to error')
    const fallbackProducts = getFallbackProducts()
    return NextResponse.json(fallbackProducts)
  }
}

