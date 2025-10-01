import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Allow all roles except REQUESTER to edit products
    if (!session || session.user?.role === 'REQUESTER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, category, model, price, requiresApproval, responsibleRole } = body

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (model !== undefined) updateData.model = model
    if (price !== undefined) updateData.price = price
    if (requiresApproval !== undefined) updateData.requiresApproval = requiresApproval
    if (responsibleRole !== undefined) {
      if (!['IT_SUPPORT', 'EMPFANG'].includes(responsibleRole)) {
        return NextResponse.json(
          { error: 'Invalid responsibleRole. Must be IT_SUPPORT or EMPFANG' },
          { status: 400 }
        )
      }
      updateData.responsibleRole = responsibleRole
    }

    const { data: updatedProduct, error } = await supabase
      .from('Product')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating product:', error)
      return NextResponse.json({ error: 'Fehler beim Aktualisieren des Produkts' }, { status: 500 })
    }

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Produkt nicht gefunden' }, { status: 404 })
    }

    console.log(`✅ Updated product: ${updatedProduct.name}`)
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Allow all roles except REQUESTER to delete products
    if (!session || session.user?.role === 'REQUESTER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // First check if product exists
    const { data: product, error: fetchError } = await supabase
      .from('Product')
      .select('id, name')
      .eq('id', id)
      .single()

    if (fetchError || !product) {
      return NextResponse.json({ error: 'Produkt nicht gefunden' }, { status: 404 })
    }

    // Delete the product
    const { error: deleteError } = await supabase
      .from('Product')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('❌ Error deleting product:', deleteError)
      return NextResponse.json({ error: 'Fehler beim Löschen des Produkts' }, { status: 500 })
    }

    console.log(`✅ Deleted product: ${product.name}`)
    return NextResponse.json({ message: 'Produkt erfolgreich gelöscht' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
