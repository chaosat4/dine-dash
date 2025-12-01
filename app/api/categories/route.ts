import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStaffSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    
    // Try to get restaurant from staff session first
    const session = await verifyStaffSession()
    const targetRestaurantId = session?.restaurantId || restaurantId

    if (!targetRestaurantId) {
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 })
    }

    const categories = await prisma.category.findMany({
      where: { 
        restaurantId: targetRestaurantId,
        isActive: true 
      },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyStaffSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, image, sortOrder } = body

    // Get max sort order
    const maxOrder = await prisma.category.findFirst({
      where: { restaurantId: session.restaurantId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    })

    const category = await prisma.category.create({
      data: {
        restaurantId: session.restaurantId,
        name,
        image,
        sortOrder: sortOrder || (maxOrder?.sortOrder || 0) + 1,
        isActive: true,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
