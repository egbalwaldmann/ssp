import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

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

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: order, error } = await supabase
      .from('Order')
      .select(`
        *,
        items:OrderItem(
          *,
          product:Product(*)
        ),
        user:User(
          name,
          email,
          department
        ),
        statusHistory:StatusHistory(
          *,
          changedBy:User!StatusHistory_changedById_fkey(
            name,
            email
          )
        ),
        comments:Comment(
          *,
          user:User!Comment_userId_fkey(
            name,
            email
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Error fetching order:', error)
      return NextResponse.json({ error: 'Bestellung nicht gefunden' }, { status: 404 })
    }

    if (!order) {
      return NextResponse.json({ error: 'Bestellung nicht gefunden' }, { status: 404 })
    }

    // Check if user has access to this order
    if (session.user.role === 'REQUESTER' && order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('❌ Error fetching order:', error)
    return NextResponse.json({ error: 'Fehler beim Laden der Bestellung' }, { status: 500 })
  }
}