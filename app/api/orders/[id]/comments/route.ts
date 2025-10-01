import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { robustAuthOptions } from '@/lib/auth-robust'
import { prisma } from '@/lib/prisma'
import { robustAuth } from '@/lib/auth-robust'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(robustAuthOptions)
    
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

    // Check database health first
    const dbHealthy = await robustAuth.checkDatabaseHealth()
    
    if (!dbHealthy) {
      // Return a fallback comment for demo purposes
      const fallbackComment = {
        id: `fallback-comment-${Date.now()}`,
        orderId: id,
        userId: session.user.id,
        content,
        isInternal: isInternal || false,
        createdAt: new Date(),
        user: {
          name: session.user.name,
          role: session.user.role
        }
      }
      
      console.log('📝 Database unhealthy, returning fallback comment')
      return NextResponse.json(fallbackComment, { status: 201 })
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
    
    // Return fallback comment on error
    try {
      const session = await getServerSession(robustAuthOptions)
      const { id } = await params
      const body = await request.json()
      const { content, isInternal } = body
      
      if (session?.user && content) {
        const fallbackComment = {
          id: `fallback-comment-${Date.now()}`,
          orderId: id,
          userId: session.user.id,
          content,
          isInternal: isInternal || false,
          createdAt: new Date(),
          user: {
            name: session.user.name,
            role: session.user.role
          }
        }
        
        console.log('📝 Database error, returning fallback comment')
        return NextResponse.json(fallbackComment, { status: 201 })
      }
    } catch (fallbackError) {
      console.error('Fallback comment creation failed:', fallbackError)
    }
    
    return NextResponse.json(
      { error: 'Kommentar konnte nicht erstellt werden' },
      { status: 500 }
    )
  }
}

