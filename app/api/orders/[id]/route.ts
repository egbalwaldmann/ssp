import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            department: true,
            costCenter: true
          }
        },
        items: {
          include: {
            product: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                name: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        approvals: {
          include: {
            approver: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        statusHistory: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        asset: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Bestellung nicht gefunden' }, { status: 404 })
    }

    // Check authorization
    if (
      session.user.role === 'REQUESTER' &&
      order.userId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Bestellung konnte nicht abgerufen werden' },
      { status: 500 }
    )
  }
}

