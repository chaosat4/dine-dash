import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStaffSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const restaurantId = searchParams.get('restaurantId')

    // Try to get restaurant from staff session first
    const session = await verifyStaffSession()
    const targetRestaurantId = session?.restaurantId || restaurantId

    if (!targetRestaurantId) {
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 })
    }

    const where: Record<string, unknown> = {
      restaurantId: targetRestaurantId,
    }
    if (categoryId) {
      where.categoryId = categoryId
    }

    const items = await prisma.menuItem.findMany({
      where,
      include: {
        category: true,
        customizations: true,
      },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
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
    const { name, description, price, image, isVeg, isAvailable, categoryId, sortOrder } = body

    const item = await prisma.menuItem.create({
      data: {
        restaurantId: session.restaurantId,
        name,
        description,
        price,
        image,
        isVeg: isVeg ?? false,
        isAvailable: isAvailable ?? true,
        categoryId,
        sortOrder: sortOrder || 0,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    )
  }
}
