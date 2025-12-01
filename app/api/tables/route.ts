import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStaffSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    
    // Try to get restaurant from staff session first, then from query param
    const session = await verifyStaffSession()
    const targetRestaurantId = session?.restaurantId || restaurantId

    if (!targetRestaurantId) {
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 })
    }

    const tables = await prisma.table.findMany({
      where: { 
        restaurantId: targetRestaurantId,
        isActive: true 
      },
      orderBy: { number: 'asc' },
    })
    
    return NextResponse.json(tables)
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
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
    const { number, name, capacity } = body

    const table = await prisma.table.create({
      data: {
        restaurantId: session.restaurantId,
        number,
        name,
        capacity: capacity || 4,
        isActive: true,
      },
    })

    return NextResponse.json(table, { status: 201 })
  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    )
  }
}
