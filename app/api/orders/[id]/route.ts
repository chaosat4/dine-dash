import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Try to find by ID first, then by orderNumber
    let order = await prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    })

    if (!order) {
      order = await prisma.order.findFirst({
        where: { orderNumber: id },
        include: {
          table: true,
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      })
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, paymentStatus, paymentMethod } = body

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (paymentMethod) updateData.paymentMethod = paymentMethod

    // Try to update by ID first, then by orderNumber
    let order = await prisma.order.findUnique({ where: { id } })
    
    if (!order) {
      order = await prisma.order.findFirst({ where: { orderNumber: id } })
    }
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: updateData,
      include: {
        table: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

