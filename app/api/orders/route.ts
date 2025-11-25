import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber, getEstimatedTime } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const phone = searchParams.get('phone')

    const where: Record<string, unknown> = {}
    
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

    const orderNumber = generateOrderNumber()
    const calcEstimatedTime = estimatedTime || getEstimatedTime(items.length)

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: 'CONFIRMED',
        tableId,
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

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

