import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { content, isInternal } = body

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Kommentarinhalt ist erforderlich' },
        { status: 400 }
      )
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id }
    })

    if (!order) {
      return NextResponse.json({ error: 'Bestellung nicht gefunden' }, { status: 404 })
    }

    // Only agents can create internal comments
    const canCreateInternalComment = ['IT_AGENT', 'RECEPTION_AGENT', 'ADMIN'].includes(
      session.user.role
    )

    if (isInternal && !canCreateInternalComment) {
      return NextResponse.json(
        { error: 'Nur Agenten können interne Kommentare erstellen' },
        { status: 403 }
      )
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        orderId: id,
        userId: session.user.id,
        content,
        isInternal: isInternal || false
      },
      include: {
        user: {
          select: {
            name: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Kommentar konnte nicht erstellt werden' },
      { status: 500 }
    )
  }
}

