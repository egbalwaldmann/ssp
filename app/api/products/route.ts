import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    console.log('🛍️ Fetching products with filters:', { category, search })
    
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Build query
    let query = supabase
      .from('Product')
      .select('*')
      .eq('isActive', true)
      .order('name', { ascending: true })

    // Apply filters
    if (category && category !== 'ALL') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,model.ilike.%${search}%`)
    }

    const { data: products, error } = await query

    if (error) {
      console.error('❌ Error fetching products:', error)
      return NextResponse.json({ error: 'Fehler beim Laden der Produkte' }, { status: 500 })
    }
    
    console.log(`✅ Fetched ${products?.length || 0} products from Supabase`)
    console.log(`📦 Returning ${products?.length || 0} products`)
    return NextResponse.json(products || [])
  } catch (error) {
    console.error('❌ Error fetching products:', error)
    return NextResponse.json({ error: 'Fehler beim Laden der Produkte' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['IT_SUPPORT', 'EMPFANG', 'ADMIN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, category, model, price, requiresApproval, responsibleRole } = body

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: product, error } = await supabase
      .from('Product')
      .insert({
        name,
        description: description || null,
        category,
        model: model || null,
        price: price || null,
        requiresApproval: requiresApproval || false,
        responsibleRole: responsibleRole || (session.user?.role === 'IT_SUPPORT' ? 'IT_SUPPORT' : 'EMPFANG'),
        isActive: true
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating product:', error)
      return NextResponse.json({ error: 'Fehler beim Erstellen des Produkts' }, { status: 500 })
    }

    console.log(`✅ Created product: ${product.name}`)
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating product:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen des Produkts' }, { status: 500 })
  }
}