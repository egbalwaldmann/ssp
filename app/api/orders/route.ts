import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber, requiresApproval } from '@/lib/workflow'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    console.log('📋 Fetching orders for user:', session.user.email)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const where: any = {}
    
    // Filter by user role
    if (session.user.role === 'REQUESTER') {
      where.userId = session.user.id
    }
    
    if (status) {
      where.status = status
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            department: true
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
    return NextResponse.json({ error: 'Fehler beim Laden der Bestellungen' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { items, costCenter, specialRequest, justification } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Keine Artikel in der Bestellung' }, { status: 400 })
    }

    if (!costCenter) {
      return NextResponse.json({ error: 'Kostenstelle ist erforderlich' }, { status: 400 })
    }

    console.log('🛒 Creating order for user:', session.user.email)

    // Fetch products to check if they require approval
    const productIds = items.map((item: any) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    const productMap = new Map(products.map(p => [p.id, p]))
    
    // Check if any item requires approval or if there's a special request
    const needsApproval = items.some((item: any) => {
      const product = productMap.get(item.productId)
      return product?.requiresApproval || false
    }) || !!specialRequest

    const orderNumber = generateOrderNumber()
    const orderStatus = needsApproval ? 'PENDING_APPROVAL' : 'IN_REVIEW'

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        costCenter,
        specialRequest,
        justification,
        status: orderStatus,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            department: true
          }
        }
      }
    })

    console.log(`✅ Created order ${orderNumber} with status ${orderStatus}`)
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating order:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen der Bestellung' }, { status: 500 })
  }
}