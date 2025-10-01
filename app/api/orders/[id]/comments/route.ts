import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

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

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if order exists
    const { data: order, error: orderError } = await supabase
      .from('Order')
      .select('id')
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Bestellung nicht gefunden' }, { status: 404 })
    }

    // Only agents can create internal comments
    const canCreateInternalComment = ['IT_SUPPORT', 'EMPFANG', 'APPROVER', 'ADMIN'].includes(
      session.user.role
    )

    if (isInternal && !canCreateInternalComment) {
      return NextResponse.json(
        { error: 'Nur Agenten können interne Kommentare erstellen' },
        { status: 403 }
      )
    }

    // Create comment
    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    const { data: comment, error: commentError } = await supabase
      .from('Comment')
      .insert({
        id: commentId,
        orderId: id,
        userId: session.user.id,
        content: content.trim(),
        isInternal: isInternal || false,
        createdAt: now
      })
      .select(`
        *,
        user:User!Comment_userId_fkey(
          name,
          email
        )
      `)
      .single()

    if (commentError) {
      console.error('❌ Error creating comment:', commentError)
      return NextResponse.json(
        { error: 'Kommentar konnte nicht erstellt werden', details: commentError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating comment:', error)
    return NextResponse.json(
      { error: 'Kommentar konnte nicht erstellt werden' },
      { status: 500 }
    )
  }
}
