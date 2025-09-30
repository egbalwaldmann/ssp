import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber, requiresApproval } from '@/lib/workflow'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

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

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items, specialRequest, justification } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      )
    }

    // Create order
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
            note: 'Order created'
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

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

