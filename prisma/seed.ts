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
      name: 'Test User',
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
      name: 'IT Support',
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
      name: 'Reception Support',
      role: 'RECEPTION_AGENT',
      costCenter: 'RCP-001',
      department: 'Reception'
    }
  })

  const approver = await prisma.user.upsert({
    where: { email: 'manager@bund.de' },
    update: {},
    create: {
      email: 'manager@bund.de',
      name: 'Department Manager',
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
      name: 'System Admin',
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
      description: 'HD webcam for video calls and conferences',
      requiresApproval: false
    },
    {
      name: 'Jabra Evolve2 65 (Bluetooth)',
      category: 'HEADSET',
      model: 'Evolve2 65',
      imageUrl: '/products/headset-jabra-evolve2-65.jpg',
      description: 'Wireless Bluetooth headset with active noise cancellation',
      requiresApproval: false
    },
    {
      name: 'Jabra Evolve2 40 (Wired)',
      category: 'HEADSET',
      model: 'Evolve2 40',
      imageUrl: '/products/headset-jabra-evolve2-40.jpg',
      description: 'Wired USB headset with superior sound quality',
      requiresApproval: false
    },
    {
      name: 'Cherry GENTIX Silent Mouse',
      category: 'MOUSE',
      model: 'GENTIX Silent',
      imageUrl: '/products/mouse-cherry-gentix.jpg',
      description: 'Silent mouse for quiet office environments',
      requiresApproval: false
    },
    {
      name: 'Logitech Lift Ergonomic Mouse',
      category: 'MOUSE',
      model: 'Lift',
      imageUrl: '/products/mouse-logitech-lift.jpg',
      description: 'Ergonomic vertical mouse for comfortable use',
      requiresApproval: false
    },
    {
      name: 'Cherry Stream Keyboard',
      category: 'KEYBOARD',
      model: 'JK-8500',
      imageUrl: '/products/keyboard-cherry-stream.jpg',
      description: 'Professional keyboard with low-profile keys',
      requiresApproval: false
    },
    {
      name: 'Verbatim USB-C to HDMI Adapter',
      category: 'ADAPTER',
      model: 'USB-C HDMI',
      imageUrl: '/products/adapter-usbc-hdmi.jpg',
      description: 'Connect your USB-C device to HDMI displays',
      requiresApproval: false
    },
    {
      name: 'ROLINE HDMI Cable High Speed',
      category: 'CABLE',
      model: 'HDMI 2.0',
      imageUrl: '/products/cable-hdmi-roline.jpg',
      description: 'High-speed HDMI cable for 4K displays',
      requiresApproval: false
    },
    {
      name: 'Printer Toner',
      category: 'PRINTER_TONER',
      imageUrl: '/products/toner-generic.jpg',
      description: 'Various toner cartridges available for all office printers',
      requiresApproval: false
    },
    {
      name: 'Desktop Speakers',
      category: 'SPEAKERS',
      imageUrl: '/products/speakers-generic.jpg',
      description: 'Compact desktop speakers for multimedia',
      requiresApproval: false
    },
    // Office Supplies
    {
      name: 'Whiteboard',
      category: 'WHITEBOARD',
      imageUrl: '/products/whiteboard.jpg',
      description: 'Various sizes available - specify in special requests',
      requiresApproval: false
    },
    {
      name: 'Pinboard',
      category: 'PINBOARD',
      imageUrl: '/products/pinboard.jpg',
      description: 'Cork pinboard for notices and documents',
      requiresApproval: false
    },
    {
      name: 'Flipchart Paper',
      category: 'FLIPCHART',
      imageUrl: '/products/flipchart.jpg',
      description: 'Flipchart paper pads for meetings and presentations',
      requiresApproval: false
    },
    {
      name: 'Office Chair',
      category: 'CHAIR',
      imageUrl: '/products/chair.jpg',
      description: 'Ergonomic office chair - requires manager approval',
      requiresApproval: true
    },
    {
      name: 'Business Prints & Envelopes',
      category: 'BUSINESS_PRINTS',
      imageUrl: '/products/business-prints.jpg',
      description: 'Business cards, letterheads, and envelopes',
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

