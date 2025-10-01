import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    console.log('📋 Fetching orders for user:', session.user.email)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Build query
    let query = supabase
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
        )
      `)
      .order('createdAt', { ascending: false })

    // Filter by user role
    if (session.user.role === 'REQUESTER') {
      query = query.eq('userId', session.user.id)
    }
    
    if (status) {
      query = query.eq('status', status)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('❌ Error fetching orders:', error)
      return NextResponse.json({ error: 'Fehler beim Laden der Bestellungen' }, { status: 500 })
    }

    console.log(`✅ Fetched ${orders?.length || 0} orders from Supabase`)
    return NextResponse.json(orders || [])
  } catch (error) {
    console.error('❌ Error fetching orders:', error)
    return NextResponse.json({ error: 'Fehler beim Laden der Bestellungen' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { items, costCenter, specialRequest, justification } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Keine Artikel in der Bestellung' }, { status: 400 })
    }

    if (!costCenter) {
      return NextResponse.json({ error: 'Kostenstelle ist erforderlich' }, { status: 400 })
    }

    console.log('🛒 Creating order for user:', session.user.email)

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch products to check if they require approval
    const productIds = items.map((item: any) => item.productId)
    console.log('🔍 Checking products:', productIds)
    
    const { data: products, error: productsError } = await supabase
      .from('Product')
      .select('id, requiresApproval')
      .in('id', productIds)

    if (productsError) {
      console.error('❌ Error fetching products:', productsError)
      return NextResponse.json({ error: 'Fehler beim Laden der Produkte' }, { status: 500 })
    }

    console.log('📦 Found products:', products?.length || 0)
    
    // Check if all requested products exist
    const foundProductIds = products?.map(p => p.id) || []
    const missingProducts = productIds.filter(id => !foundProductIds.includes(id))
    
    if (missingProducts.length > 0) {
      console.error('❌ Missing products:', missingProducts)
      return NextResponse.json({ 
        error: `Produkte nicht gefunden: ${missingProducts.join(', ')}. Bitte aktualisieren Sie den Warenkorb.` 
      }, { status: 400 })
    }

    const productMap = new Map(products?.map(p => [p.id, p]) || [])
    
    // Check if any item requires approval or if there's a special request
    const needsApproval = items.some((item: any) => {
      const product = productMap.get(item.productId)
      return product?.requiresApproval || false
    }) || !!specialRequest

    const orderNumber = `BEST-${Date.now()}`
    const orderStatus = needsApproval ? 'PENDING_APPROVAL' : 'IN_REVIEW'

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('Order')
      .insert({
        orderNumber,
        userId: session.user.id,
        costCenter,
        specialRequest,
        justification,
        status: orderStatus
      })
      .select()
      .single()

    if (orderError) {
      console.error('❌ Error creating order:', orderError)
      return NextResponse.json({ error: 'Fehler beim Erstellen der Bestellung' }, { status: 500 })
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity
    }))

    const { error: itemsError } = await supabase
      .from('OrderItem')
      .insert(orderItems)

    if (itemsError) {
      console.error('❌ Error creating order items:', itemsError)
      return NextResponse.json({ error: 'Fehler beim Erstellen der Bestellpositionen' }, { status: 500 })
    }

    // Fetch the complete order with items and user data
    const { data: completeOrder, error: fetchError } = await supabase
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
        )
      `)
      .eq('id', order.id)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching complete order:', fetchError)
      return NextResponse.json({ error: 'Bestellung erstellt, aber Fehler beim Laden der Details' }, { status: 500 })
    }

    console.log(`✅ Created order ${orderNumber} with status ${orderStatus}`)
    return NextResponse.json(completeOrder, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating order:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen der Bestellung' }, { status: 500 })
  }
}