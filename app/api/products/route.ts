import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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