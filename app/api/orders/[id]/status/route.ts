import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canTransition } from '@/lib/workflow'
import { OrderStatus } from '@prisma/client'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Only agents and admins can update status
    if (!['IT_AGENT', 'RECEPTION_AGENT', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, note } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status ist erforderlich' },
        { status: 400 }
      )
    }


    // Get current order
    const order = await prisma.order.findUnique({
      where: { id }
    })

    if (!order) {
      return NextResponse.json({ error: 'Bestellung nicht gefunden' }, { status: 404 })
    }

    // Check if transition is allowed
    if (!canTransition(order.status, status as OrderStatus)) {
      return NextResponse.json(
        { error: `Übergang von ${order.status} zu ${status} nicht möglich` },
        { status: 400 }
      )
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: status as OrderStatus,
        statusHistory: {
          create: {
            fromStatus: order.status,
            toStatus: status as OrderStatus,
            changedBy: session.user.id,
            note
          }
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true,
        statusHistory: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Bestellstatus konnte nicht aktualisiert werden' },
      { status: 500 }
    )
  }
}

