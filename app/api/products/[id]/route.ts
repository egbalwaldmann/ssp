import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { responsibleRole } = body

    if (!responsibleRole || !['IT_SUPPORT', 'EMPFANG'].includes(responsibleRole)) {
      return NextResponse.json(
        { error: 'Invalid responsibleRole. Must be IT_SUPPORT or EMPFANG' },
        { status: 400 }
      )
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { responsibleRole }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
