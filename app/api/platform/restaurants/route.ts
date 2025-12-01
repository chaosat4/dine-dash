import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyPlatformAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'

    const where: Record<string, unknown> = {}
    
    if (status === 'active') {
      where.isActive = true
    } else if (status === 'pending') {
      where.isVerified = true
      where.isActive = false
    } else if (status === 'inactive') {
      where.isActive = false
      where.isVerified = false
    }

    const restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        brandSettings: true,
        _count: {
          select: {
            orders: true,
            staff: true,
            tables: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(restaurants)
  } catch (error) {
    console.error('Platform restaurants error:', error)
    return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 })
  }
}

