import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    console.log('🛍️ Fetching products with filters:', { category, search })
    
    const where: any = {
      isActive: true
    }

    if (category && category !== 'ALL') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } }
      ]
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    })
    
    console.log(`✅ Fetched ${products.length} products from database`)
    console.log(`📦 Returning ${products.length} products`)
    return NextResponse.json(products)
  } catch (error) {
    console.error('❌ Error fetching products:', error)
    return NextResponse.json({ error: 'Fehler beim Laden der Produkte' }, { status: 500 })
  }
}

