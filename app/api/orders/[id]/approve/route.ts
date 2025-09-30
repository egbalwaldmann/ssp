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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only approvers and admins can approve/reject
    if (!['APPROVER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { approved, comment } = body

    // Find pending approval for this order
    const approval = await prisma.approval.findFirst({
      where: {
        orderId: id,
        approverId: session.user.id,
        status: 'PENDING'
      }
    })

    if (!approval) {
      return NextResponse.json(
        { error: 'No pending approval found' },
        { status: 404 }
      )
    }

    // Update approval
    const updatedApproval = await prisma.approval.update({
      where: { id: approval.id },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED',
        comment,
        decidedAt: new Date()
      }
    })

    // Update order status
    const newOrderStatus = approved ? 'APPROVED' : 'REJECTED'
    
    await prisma.order.update({
      where: { id },
      data: {
        status: newOrderStatus,
        statusHistory: {
          create: {
            fromStatus: 'PENDING_APPROVAL',
            toStatus: newOrderStatus,
            changedBy: session.user.id,
            note: comment || (approved ? 'Approved' : 'Rejected')
          }
        }
      }
    })

    return NextResponse.json(updatedApproval)
  } catch (error) {
    console.error('Error processing approval:', error)
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    )
  }
}

