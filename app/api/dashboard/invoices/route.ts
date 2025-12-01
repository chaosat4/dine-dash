import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStaffSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await verifyStaffSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || 'month'

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (range) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default: // all
        startDate = new Date(0) // Beginning of time
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        restaurantId: session.restaurantId,
        ...(range !== 'all' && { createdAt: { gte: startDate } }),
      },
      include: {
        order: {
          include: {
            table: true,
            items: {
              include: {
                menuItem: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Invoices fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

// Create invoice from order
export async function POST(request: NextRequest) {
  try {
    const session = await verifyStaffSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId } = body

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: {
          include: {
            taxSettings: {
              where: { isActive: true },
            },
          },
        },
        items: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.restaurantId !== session.restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { orderId },
    })

    if (existingInvoice) {
      return NextResponse.json({ invoice: existingInvoice })
    }

    // Calculate tax breakdown
    const taxSettings = order.restaurant.taxSettings
    const subtotal = order.subtotal
    const taxBreakdown = taxSettings.map((tax) => ({
      name: tax.name,
      rate: tax.rate,
      amount: (subtotal * tax.rate) / 100,
    }))
    const totalTax = taxBreakdown.reduce((sum, t) => sum + t.amount, 0)

    // Generate invoice number
    const today = new Date()
    const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
    const count = await prisma.invoice.count({
      where: {
        restaurantId: session.restaurantId,
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        },
      },
    })
    const invoiceNumber = `INV-${datePrefix}-${String(count + 1).padStart(4, '0')}`

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        restaurantId: session.restaurantId,
        invoiceNumber,
        orderId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        subtotal,
        taxBreakdown,
        totalTax,
        discount: 0,
        tip: order.tip,
        grandTotal: subtotal + totalTax + order.tip,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paidAt: order.paymentStatus === 'PAID' ? new Date() : null,
      },
      include: {
        order: {
          include: {
            table: true,
            items: {
              include: {
                menuItem: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Invoice creation error:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}

