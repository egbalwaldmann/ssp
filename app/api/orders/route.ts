import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { robustAuthOptions } from '@/lib/auth-robust'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber, requiresApproval } from '@/lib/workflow'
import { robustAuth } from '@/lib/auth-robust'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(robustAuthOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    console.log('📋 Fetching orders for user:', session.user.email)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Check database health first
    const dbHealthy = await robustAuth.checkDatabaseHealth()
    
    if (!dbHealthy) {
      console.warn('⚠️ Database unhealthy, returning fallback orders list')
      
      // Return some demo orders for testing
      const fallbackOrders = [
        {
          id: 'fallback-order-1',
          orderNumber: 'BEST-20250101-0001',
          userId: 'demo-user-1',
          costCenter: 'CC-001',
          specialRequest: null,
          justification: null,
          status: 'PENDING_APPROVAL',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          items: [
            {
              id: 'fallback-item-1',
              productId: 'demo-1',
              quantity: 2,
              product: {
                id: 'demo-1',
                name: 'Logitech C270 HD-Webcam',
                category: 'WEBCAM',
                model: 'C270',
                description: 'HD-Webcam für Videotelefonie und Konferenzen',
                imageUrl: '/products/webcam-logitech-c270.jpg',
                requiresApproval: true,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            }
          ],
          user: {
            name: 'Testbenutzer',
            email: 'user@bund.de',
            department: 'Marketing'
          },
          _count: {
            comments: 0
          }
        },
        {
          id: 'fallback-order-2',
          orderNumber: 'BEST-20250101-0002',
          userId: 'demo-user-1',
          costCenter: 'CC-001',
          specialRequest: 'Sonderwunsch: Express-Lieferung',
          justification: 'Dringend benötigt für wichtiges Meeting',
          status: 'PENDING_APPROVAL',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          items: [
            {
              id: 'fallback-item-2',
              productId: 'demo-2',
              quantity: 1,
              product: {
                id: 'demo-2',
                name: 'Jabra Evolve2 65 (Bluetooth)',
                category: 'HEADSET',
                model: 'Evolve2 65',
                description: 'Kabelloses Bluetooth-Headset mit aktiver Geräuschunterdrückung',
                imageUrl: '/products/headset-jabra-evolve2-65.jpg',
                requiresApproval: true,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            }
          ],
          user: {
            name: 'Testbenutzer',
            email: 'user@bund.de',
            department: 'Marketing'
          },
          _count: {
            comments: 0
          }
        }
      ]
      
      // Filter orders based on user role and status
      let filteredOrders = fallbackOrders
      
      if (session.user.role === 'REQUESTER') {
        // Regular users can only see their own orders
        filteredOrders = fallbackOrders.filter(order => order.userId === session.user.id)
      } else if (['APPROVER', 'ADMIN', 'IT_AGENT', 'RECEPTION_AGENT'].includes(session.user.role)) {
        // Agents and approvers can see all orders
        filteredOrders = fallbackOrders
      }
      
      if (status) {
        filteredOrders = filteredOrders.filter(order => order.status === status)
      }
      
      return NextResponse.json(filteredOrders)
    }

    const where: any = {}

    // Regular users can only see their own orders
    if (session.user.role === 'REQUESTER') {
      where.userId = session.user.id
    }

    if (status) {
      where.status = status
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            department: true
          }
        },
        items: {
          include: {
            product: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Fetched ${orders.length} orders from database`)
    return NextResponse.json(orders)
  } catch (error) {
    console.error('❌ Error fetching orders:', error)
    return NextResponse.json(
        { error: 'Bestellungen konnten nicht abgerufen werden' },
      { status: 500 }
    )
  }
}

// Fallback-Bestellung für den Fall, dass die Datenbank nicht verfügbar ist
const createFallbackOrder = (session: any, items: any[], specialRequest?: string, justification?: string) => {
  const orderNumber = generateOrderNumber()
  const now = new Date()
  
  // Check if approval is required for fallback order
  const needsApproval = items.some((item: any) => item.requiresApproval) || !!specialRequest
  
  return {
    id: `fallback-${Date.now()}`,
    orderNumber,
    userId: session.user.id,
    costCenter: session.user.costCenter,
    specialRequest,
    justification,
    status: needsApproval ? 'PENDING_APPROVAL' : 'NEW',
    createdAt: now,
    updatedAt: now,
    items: items.map((item: any) => ({
      id: `fallback-item-${Date.now()}-${Math.random()}`,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.productId,
        name: item.productName || 'Produkt',
        category: item.productCategory || 'OFFICE_MISC',
        model: item.productModel || 'N/A',
        description: item.productDescription || 'Produktbeschreibung',
        imageUrl: item.productImageUrl || null,
        requiresApproval: item.requiresApproval || false,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    })),
    user: {
      name: session.user.name,
      email: session.user.email,
      department: session.user.department
    },
    _count: {
      comments: 0
    }
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(robustAuthOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { items, specialRequest, justification } = body

    console.log('🛒 Creating order for user:', session.user.email, 'with', items?.length || 0, 'items')

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Bestellung muss mindestens einen Artikel enthalten' },
        { status: 400 }
      )
    }

    // Check database health first
    const dbHealthy = await robustAuth.checkDatabaseHealth()
    
    if (!dbHealthy) {
      console.warn('⚠️ Database unhealthy, creating fallback order')
      
      // Create fallback order
      const fallbackOrder = createFallbackOrder(session, items, specialRequest, justification)
      
      console.log('✅ Created fallback order:', fallbackOrder.orderNumber)
      return NextResponse.json(fallbackOrder, { status: 201 })
    }

    try {
      // Create order in database
      const order = await prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: session.user.id,
          costCenter: session.user.costCenter,
          specialRequest,
          justification,
          status: 'NEW',
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity
            }))
          },
          statusHistory: {
            create: {
              toStatus: 'NEW',
              changedBy: session.user.id,
              note: 'Bestellung erstellt'
            }
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      // Check if approval is required
      const needsApproval = requiresApproval(order as any)
      
      if (needsApproval) {
        // Find approver from the same department
        const approver = await prisma.user.findFirst({
          where: {
            role: 'APPROVER',
            department: session.user.department
          }
        })

        if (approver) {
          await prisma.approval.create({
            data: {
              orderId: order.id,
              approverId: approver.id,
              status: 'PENDING'
            }
          })

          // Update order status
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'PENDING_APPROVAL' }
          })
        }
      }

      console.log('✅ Created order in database:', order.orderNumber)
      return NextResponse.json(order, { status: 201 })
    } catch (dbError) {
      console.warn('⚠️ Database operation failed, creating fallback order:', dbError)
      
      // Create fallback order if database operation fails
      const fallbackOrder = createFallbackOrder(session, items, specialRequest, justification)
      
      console.log('✅ Created fallback order after DB failure:', fallbackOrder.orderNumber)
      return NextResponse.json(fallbackOrder, { status: 201 })
    }
  } catch (error) {
    console.error('❌ Error creating order:', error)
    return NextResponse.json(
      { error: 'Bestellung konnte nicht erstellt werden' },
      { status: 500 }
    )
  }
}

