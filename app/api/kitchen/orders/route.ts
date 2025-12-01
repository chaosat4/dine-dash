import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStaffSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await verifyStaffSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get kitchen-relevant orders
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: session.restaurantId,
        status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Calculate kitchen stats
    const pendingCount = orders.filter((o) =>
      ['PENDING', 'CONFIRMED'].includes(o.status)
    ).length
    const preparingCount = orders.filter((o) => o.status === 'PREPARING').length
    const readyCount = orders.filter((o) => o.status === 'READY').length

    // Calculate average prep time from completed orders today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const completedToday = await prisma.order.findMany({
      where: {
        restaurantId: session.restaurantId,
        status: 'COMPLETED',
        createdAt: { gte: todayStart },
      },
    })

    let avgPrepTime = 0
    if (completedToday.length > 0) {
      const totalTime = completedToday.reduce((sum, o) => {
        const prepTime = Math.floor(
          (new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime()) / 60000
        )
        return sum + prepTime
      }, 0)
      avgPrepTime = Math.round(totalTime / completedToday.length)
    }

    return NextResponse.json({
      orders,
      stats: {
        pendingCount,
        preparingCount,
        readyCount,
        avgPrepTime,
      },
    })
  } catch (error) {
    console.error('Kitchen orders error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

