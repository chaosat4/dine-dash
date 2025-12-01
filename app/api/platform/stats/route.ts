import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

async function verifyPlatformAdmin() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('platform-session')?.value

  if (!sessionToken) return null

  try {
    const session = JSON.parse(
      Buffer.from(sessionToken, 'base64').toString('utf-8')
    )
    if (session.exp < Date.now()) return null
    return session
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const admin = await verifyPlatformAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get restaurant counts
    const [totalRestaurants, activeRestaurants, pendingApprovals] = await Promise.all([
      prisma.restaurant.count(),
      prisma.restaurant.count({ where: { isActive: true } }),
      prisma.restaurant.count({ where: { isVerified: true, isActive: false } }),
    ])

    // Get order stats
    const orderStats = await prisma.order.aggregate({
      _count: { id: true },
      _sum: { total: true },
    })

    // Get recent restaurants
    const recentRestaurants = await prisma.restaurant.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { orders: true } },
      },
    })

    // Calculate monthly growth (simplified)
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    
    const lastMonthOrders = await prisma.order.count({
      where: { createdAt: { lt: lastMonth } },
    })
    
    const currentOrders = orderStats._count.id || 0
    const monthlyGrowth = lastMonthOrders > 0 
      ? Math.round(((currentOrders - lastMonthOrders) / lastMonthOrders) * 100)
      : 100

    return NextResponse.json({
      totalRestaurants,
      activeRestaurants,
      pendingApprovals,
      totalOrders: orderStats._count.id || 0,
      totalRevenue: orderStats._sum.total || 0,
      monthlyGrowth,
      recentRestaurants,
    })
  } catch (error) {
    console.error('Platform stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

