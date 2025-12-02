import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStaffSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const restaurantId = searchParams.get('restaurantId')
    
    // Try to get restaurant from staff session first, then from query param
    const session = await verifyStaffSession()
    const targetRestaurantId = session?.restaurantId || restaurantId

    if (!targetRestaurantId) {
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 })
    }

    const where: Record<string, unknown> = {
      restaurantId: targetRestaurantId,
    }
    
    if (status) {
      const statuses = status.split(',')
      where.status = { in: statuses }
    }

    const calls = await prisma.waiterCall.findMany({
      where,
      include: {
        table: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(calls)
  } catch (error) {
    console.error('Error fetching waiter calls:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waiter calls' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, tableId, reason } = body

    if (!restaurantId || !tableId) {
      return NextResponse.json(
        { error: 'Restaurant ID and Table ID required' },
        { status: 400 }
      )
    }

    // Check if there's already a pending call for this table
    const existingCall = await prisma.waiterCall.findFirst({
      where: {
        restaurantId,
        tableId,
        status: 'PENDING',
      },
    })

    if (existingCall) {
      return NextResponse.json(
        { error: 'A waiter has already been called for this table', existing: true },
        { status: 400 }
      )
    }

    const call = await prisma.waiterCall.create({
      data: {
        restaurantId,
        tableId,
        reason,
      },
      include: {
        table: true,
      },
    })

    return NextResponse.json(call, { status: 201 })
  } catch (error) {
    console.error('Error creating waiter call:', error)
    return NextResponse.json(
      { error: 'Failed to create waiter call' },
      { status: 500 }
    )
  }
}

