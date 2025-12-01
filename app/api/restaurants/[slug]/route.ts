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
      include: {
        brandSettings: true,
      },
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    if (!restaurant.isActive) {
      return NextResponse.json({ error: 'Restaurant is not active' }, { status: 403 })
    }

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurant' },
      { status: 500 }
    )
  }
}

