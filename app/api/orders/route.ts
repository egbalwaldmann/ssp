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
    const { items, costCenter, specialRequest, justification, businessCard } = body

    // Allow empty items array for business card orders
    if ((!items || !Array.isArray(items) || items.length === 0) && !businessCard) {
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

    // Handle business card orders (no products needed)
    let needsApproval = !!specialRequest || !!businessCard
    let productIds: string[] = []

    if (items && items.length > 0) {
      // Fetch products to check if they require approval
      productIds = items.map((item: any) => item.productId)
      console.log('🔍 Checking products:', productIds)
      const { data: products, error: productsError } = await supabase
        .from('Product')
        .select('id, requiresApproval, isBundle')
        .in('id', productIds)

      if (productsError) {
        console.error('❌ Error fetching products:', productsError)
        return NextResponse.json({ 
          error: 'Fehler beim Laden der Produkte',
          details: productsError.message 
        }, { status: 500 })
      }

      console.log('📦 Found products:', products?.length || 0)
      console.log('📦 Available product IDs:', products?.map(p => p.id) || [])
      console.log('📦 Requested product IDs:', productIds)
      
      // Check if all requested products exist
      const foundProductIds = products?.map(p => p.id) || []
      const missingProducts = productIds.filter(id => !foundProductIds.includes(id))
      
      if (missingProducts.length > 0) {
        console.error('❌ Missing products:', missingProducts)
        return NextResponse.json({ 
          error: `Produkte nicht gefunden: ${missingProducts.join(', ')}. Bitte aktualisieren Sie den Warenkorb.`,
          missingProducts: missingProducts,
          availableProducts: foundProductIds
        }, { status: 400 })
      }

      const productMap = new Map(products?.map(p => [p.id, p]) || [])
      
      // Check if any item requires approval
      needsApproval = needsApproval || items.some((item: any) => {
        const product = productMap.get(item.productId)
        return product?.requiresApproval || false
      })
    }

    const orderNumber = `BEST-${Date.now()}`
    const orderStatus = needsApproval ? 'PENDING_APPROVAL' : 'IN_REVIEW'
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create order
    const now = new Date().toISOString()
    const { data: order, error: orderError } = await supabase
      .from('Order')
      .insert({
        id: orderId,
        orderNumber,
        userId: session.user.id,
        costCenter,
        specialRequest,
        justification,
        status: orderStatus,
        createdAt: now,
        updatedAt: now
      })
      .select()
      .single()

    if (orderError) {
      console.error('❌ Error creating order:', orderError)
      return NextResponse.json({ 
        error: 'Fehler beim Erstellen der Bestellung',
        details: orderError.message,
        code: orderError.code
      }, { status: 500 })
    }

    // Create order items (skip if business card only order)
    if (items && items.length > 0) {
      const orderItems = items.map((item: any, index: number) => ({
        id: `orderitem_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('OrderItem')
        .insert(orderItems)

      if (itemsError) {
        console.error('❌ Error creating order items:', itemsError)
        return NextResponse.json({ 
          error: 'Fehler beim Erstellen der Bestellpositionen',
          details: itemsError.message,
          code: itemsError.code
        }, { status: 500 })
      }
    }

    // Create approval if needed
    console.log('🔍 Order needs approval:', needsApproval, 'Order ID:', order.id)
    if (needsApproval) {
      // Check if there are any approvers in the system
      const { data: approvers, error: approverError } = await supabase
        .from('User')
        .select('id, name, email')
        .eq('role', 'APPROVER')
        .limit(1)
      
      console.log('🔍 Found approvers:', approvers, 'Error:', approverError)
      
      if (!approverError && approvers && approvers.length > 0) {
        const approvalId = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        console.log('🔍 Creating approval with ID:', approvalId, 'for order:', order.id, 'assigned to:', approvers[0].id)
        
        // Create approval record - any APPROVER can approve this order
        const { error: approvalError } = await supabase
          .from('Approval')
          .insert({
            id: approvalId,
            orderId: order.id,
            approverId: approvers[0].id, // Initial assignment, but any approver can take over
            status: 'PENDING',
            createdAt: now
          })
        
        if (approvalError) {
          console.error('❌ Error creating approval:', approvalError)
          // Don't fail the request, order is already created
        } else {
          console.log('✅ Created approval for order:', order.orderNumber, 'with ID:', approvalId)
        }
      } else {
        console.warn('⚠️ No approvers found in system - order created without approval workflow')
      }
    } else {
      console.log('ℹ️ Order does not need approval')
    }

    // Create business card order if provided
    if (businessCard) {
      const businessCardId = `businesscard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const { error: businessCardError } = await supabase
        .from('BusinessCardOrder')
        .insert({
          id: businessCardId,
          orderId: order.id,
          fullName: businessCard.fullName,
          jobTitle: businessCard.jobTitle,
          department: businessCard.department,
          email: businessCard.email,
          phone: businessCard.phone,
          mobile: businessCard.mobile,
          quantity: businessCard.quantity || 250,
          specialNotes: businessCard.specialNotes,
          createdAt: now,
          updatedAt: now
        })

      if (businessCardError) {
        console.error('❌ Error creating business card order:', businessCardError)
        // Don't fail the whole order, just log
      }
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
      return NextResponse.json({ 
        error: 'Bestellung erstellt, aber Fehler beim Laden der Details',
        details: fetchError.message,
        code: fetchError.code
      }, { status: 500 })
    }

    console.log(`✅ Created order ${orderNumber} with status ${orderStatus}`)
    return NextResponse.json(completeOrder, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating order:', error)
    return NextResponse.json({ 
      error: 'Fehler beim Erstellen der Bestellung',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : typeof error
    }, { status: 500 })
  }
}