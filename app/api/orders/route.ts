import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber, getEstimatedTime } from '@/lib/utils'
import { verifyStaffSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const phone = searchParams.get('phone')
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
    
    if (phone) {
      where.customerPhone = phone
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        table: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      restaurantId,
      tableId,
      customerName,
      customerPhone,
      items,
      subtotal,
      tax,
      total,
      specialRequests,
      estimatedTime,
    } = body

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 })
    }

    const orderNumber = generateOrderNumber()
    const calcEstimatedTime = estimatedTime || getEstimatedTime(items.length)

    // Create or update customer
    let customerId = null
    if (customerPhone) {
      const customer = await prisma.customer.upsert({
        where: {
          restaurantId_phone: {
            restaurantId,
            phone: customerPhone,
          },
        },
        create: {
          restaurantId,
          phone: customerPhone,
          name: customerName,
        },
        update: {
          name: customerName || undefined,
        },
      })
      customerId = customer.id
    }

    const order = await prisma.order.create({
      data: {
        restaurantId,
        orderNumber,
        status: 'CONFIRMED',
        tableId,
        customerId,
        customerName,
        customerPhone,
        subtotal,
        tax,
        total,
        specialRequests,
        estimatedTime: calcEstimatedTime,
        paymentStatus: 'PENDING',
        items: {
          create: items.map((item: { menuItemId: string; quantity: number; price: number; customizations?: Record<string, string>; notes?: string }) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
            customizations: item.customizations,
            notes: item.notes,
          })),
        },
      },
      include: {
        table: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    })

    // Update customer stats
    if (customerId) {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: total },
          lastOrderAt: new Date(),
        },
      })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
