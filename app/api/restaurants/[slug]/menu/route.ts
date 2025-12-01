import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const categories = await prisma.category.findMany({
      where: {
        restaurantId: restaurant.id,
        isActive: true,
      },
      include: {
        items: {
          where: { isAvailable: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            customizations: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    )
  }
}

