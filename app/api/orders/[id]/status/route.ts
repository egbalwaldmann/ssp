import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { canUserUpdateToStatus } from '@/lib/workflow'
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

    // Only agents, approvers and admins can update status
    if (!['IT_SUPPORT', 'EMPFANG', 'APPROVER', 'ADMIN'].includes(session.user.role)) {
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

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get current order
    const { data: order, error: orderError } = await supabase
      .from('Order')
      .select('status')
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Bestellung nicht gefunden' }, { status: 404 })
    }

    // Check role-based permissions for status update
    if (!canUserUpdateToStatus(session.user.role, order.status as OrderStatus, status as OrderStatus)) {
      return NextResponse.json({ 
        error: `Ihre Rolle (${session.user.role}) kann diesen Status nicht setzen: ${status}` 
      }, { status: 403 })
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('Order')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        items:OrderItem(
          *,
          product:Product(*)
        ),
        user:User(*)
      `)
      .single()

    if (updateError) {
      console.error('❌ Error updating order status:', updateError)
      return NextResponse.json({ error: 'Fehler beim Aktualisieren des Status' }, { status: 500 })
    }

    // Create status history entry
    const historyId = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    const { error: historyError } = await supabase
      .from('StatusHistory')
      .insert({
        id: historyId,
        orderId: id,
        fromStatus: order.status,
        toStatus: status,
        changedById: session.user.id,
        note,
        changedAt: now
      })

    if (historyError) {
      console.error('❌ Error creating status history:', historyError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('❌ Error updating order status:', error)
    return NextResponse.json(
      { error: 'Bestellstatus konnte nicht aktualisiert werden' },
      { status: 500 }
    )
  }
}