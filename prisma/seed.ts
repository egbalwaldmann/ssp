import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create test users
  const requester = await prisma.user.upsert({
    where: { email: 'user@bund.de' },
    update: {},
    create: {
      email: 'user@bund.de',
      name: 'Testbenutzer',
      role: 'REQUESTER',
      costCenter: 'CC-001',
      department: 'Marketing'
    }
  })

  const itAgent = await prisma.user.upsert({
    where: { email: 'it@bund.de' },
    update: {},
    create: {
      email: 'it@bund.de',
      name: 'IT-Support',
      role: 'IT_AGENT',
      costCenter: 'IT-001',
      department: 'IT'
    }
  })

  const receptionAgent = await prisma.user.upsert({
    where: { email: 'reception@bund.de' },
    update: {},
    create: {
      email: 'reception@bund.de',
      name: 'Empfangssupport',
      role: 'RECEPTION_AGENT',
      costCenter: 'RCP-001',
      department: 'Empfang'
    }
  })

  const approver = await prisma.user.upsert({
    where: { email: 'manager@bund.de' },
    update: {},
    create: {
      email: 'manager@bund.de',
      name: 'Abteilungsleiter',
      role: 'APPROVER',
      costCenter: 'CC-001',
      department: 'Marketing'
    }
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@bund.de' },
    update: {},
    create: {
      email: 'admin@bund.de',
      name: 'Systemadministrator',
      role: 'ADMIN',
      costCenter: 'ADM-001',
      department: 'IT'
    }
  })

  console.log('✅ Created users')

  // IT Accessories
  const products = [
    {
      name: 'Logitech C270 HD-Webcam',
      category: 'WEBCAM',
      model: 'C270',
      imageUrl: '/products/webcam-logitech-c270.jpg',
      description: 'HD-Webcam für Videotelefonie und Konferenzen',
      requiresApproval: false
    },
    {
      name: 'Jabra Evolve2 65 (Bluetooth)',
      category: 'HEADSET',
      model: 'Evolve2 65',
      imageUrl: '/products/headset-jabra-evolve2-65.jpg',
      description: 'Kabelloses Bluetooth-Headset mit aktiver Geräuschunterdrückung',
      requiresApproval: false
    },
    {
      name: 'Jabra Evolve2 40 (Kabelgebunden)',
      category: 'HEADSET',
      model: 'Evolve2 40',
      imageUrl: '/products/headset-jabra-evolve2-40.jpg',
      description: 'Kabelgebundenes USB-Headset mit überlegener Klangqualität',
      requiresApproval: false
    },
    {
      name: 'Cherry GENTIX Silent Maus',
      category: 'MOUSE',
      model: 'GENTIX Silent',
      imageUrl: '/products/mouse-cherry-gentix.jpg',
      description: 'Leise Maus für ruhige Büroumgebungen',
      requiresApproval: false
    },
    {
      name: 'Logitech Lift Ergonomische Maus',
      category: 'MOUSE',
      model: 'Lift',
      imageUrl: '/products/mouse-logitech-lift.jpg',
      description: 'Ergonomische vertikale Maus für komfortable Nutzung',
      requiresApproval: false
    },
    {
      name: 'Cherry Stream Tastatur',
      category: 'KEYBOARD',
      model: 'JK-8500',
      imageUrl: '/products/keyboard-cherry-stream.jpg',
      description: 'Professionelle Tastatur mit flachen Tasten',
      requiresApproval: false
    },
    {
      name: 'Verbatim USB-C zu HDMI Adapter',
      category: 'ADAPTER',
      model: 'USB-C HDMI',
      imageUrl: '/products/adapter-usbc-hdmi.jpg',
      description: 'Verbinden Sie Ihr USB-C-Gerät mit HDMI-Displays',
      requiresApproval: false
    },
    {
      name: 'ROLINE HDMI Kabel High Speed',
      category: 'CABLE',
      model: 'HDMI 2.0',
      imageUrl: '/products/cable-hdmi-roline.jpg',
      description: 'Hochgeschwindigkeits-HDMI-Kabel für 4K-Displays',
      requiresApproval: false
    },
    {
      name: 'Druckertoner',
      category: 'PRINTER_TONER',
      imageUrl: '/products/toner-generic.jpg',
      description: 'Verschiedene Tonerkartuschen für alle Bürodrucker verfügbar',
      requiresApproval: false
    },
    {
      name: 'Desktop-Lautsprecher',
      category: 'SPEAKERS',
      imageUrl: '/products/speakers-generic.jpg',
      description: 'Kompakte Desktop-Lautsprecher für Multimedia',
      requiresApproval: false
    },
    // Office Supplies
    {
      name: 'Whiteboard',
      category: 'WHITEBOARD',
      imageUrl: '/products/whiteboard.jpg',
      description: 'Verschiedene Größen verfügbar - in Sonderwünschen angeben',
      requiresApproval: false
    },
    {
      name: 'Pinnwand',
      category: 'PINBOARD',
      imageUrl: '/products/pinboard.jpg',
      description: 'Korkpinnwand für Mitteilungen und Dokumente',
      requiresApproval: false
    },
    {
      name: 'Flipchart-Papier',
      category: 'FLIPCHART',
      imageUrl: '/products/flipchart.jpg',
      description: 'Flipchart-Papierblöcke für Meetings und Präsentationen',
      requiresApproval: false
    },
    {
      name: 'Bürostuhl',
      category: 'CHAIR',
      imageUrl: '/products/chair.jpg',
      description: 'Ergonomischer Bürostuhl - erfordert Manager-Genehmigung',
      requiresApproval: true
    },
    {
      name: 'Geschäftsausdrucke & Briefumschläge',
      category: 'BUSINESS_PRINTS',
      imageUrl: '/products/business-prints.jpg',
      description: 'Visitenkarten, Briefköpfe und Briefumschläge',
      requiresApproval: false
    }
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product as any
    })
  }

  console.log('✅ Created products')
  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

