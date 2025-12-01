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
    const range = searchParams.get('range') || 'today'

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default: // today
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }

    // Get all orders for the restaurant in the date range
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: session.restaurantId,
        createdAt: { gte: startDate },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate today's stats
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayOrders = orders.filter((o) => new Date(o.createdAt) >= todayStart)

    // Calculate stats
    const totalOrders = orders.length
    const totalRevenue = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total, 0)

    const todayOrdersCount = todayOrders.length
    const todayRevenue = todayOrders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total, 0)

    const pendingOrders = orders.filter((o) =>
      ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status)
    ).length

    const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length
    const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED').length

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Top selling items
    const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {}
    for (const order of orders) {
      if (order.status === 'CANCELLED') continue
      for (const item of order.items) {
        const name = item.menuItem?.name || 'Unknown'
        if (!itemCounts[name]) {
          itemCounts[name] = { name, count: 0, revenue: 0 }
        }
        itemCounts[name].count += item.quantity
        itemCounts[name].revenue += item.price * item.quantity
      }
    }

    const topItems = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Recent orders
    const recentOrders = orders.slice(0, 10)

    return NextResponse.json({
      totalOrders,
      todayOrders: todayOrdersCount,
      totalRevenue,
      todayRevenue,
      averageOrderValue,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      topItems,
      recentOrders,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

