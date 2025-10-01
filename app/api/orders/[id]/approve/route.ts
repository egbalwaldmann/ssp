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

    // Only approvers and admins can approve/reject
    if (!['APPROVER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { approved, comment } = body

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Find pending approval for this order
    const { data: approval, error: approvalError } = await supabase
      .from('Approval')
      .select('*')
      .eq('orderId', id)
      .eq('approverId', session.user.id)
      .eq('status', 'PENDING')
      .single()

    if (approvalError || !approval) {
      return NextResponse.json(
        { error: 'Keine ausstehende Genehmigung gefunden' },
        { status: 404 }
      )
    }

    const now = new Date().toISOString()

    // Update approval
    const { data: updatedApproval, error: updateError } = await supabase
      .from('Approval')
      .update({
        status: approved ? 'APPROVED' : 'REJECTED',
        comment: comment || null,
        decidedAt: now
      })
      .eq('id', approval.id)
      .select(`
        *,
        approver:User!Approval_approverId_fkey(
          name,
          email
        )
      `)
      .single()

    if (updateError) {
      console.error('❌ Error updating approval:', updateError)
      return NextResponse.json(
        { error: 'Genehmigung konnte nicht aktualisiert werden', details: updateError.message },
        { status: 500 }
      )
    }

    // Update order status
    const newStatus = approved ? 'APPROVED' : 'REJECTED'
    const { error: orderUpdateError } = await supabase
      .from('Order')
      .update({ status: newStatus, updatedAt: now })
      .eq('id', id)

    if (orderUpdateError) {
      console.error('❌ Error updating order status:', orderUpdateError)
      // Don't fail the request, approval is already saved
    }

    return NextResponse.json(updatedApproval)
  } catch (error) {
    console.error('❌ Error processing approval:', error)
    return NextResponse.json(
      { error: 'Genehmigung konnte nicht verarbeitet werden' },
      { status: 500 }
    )
  }
}
