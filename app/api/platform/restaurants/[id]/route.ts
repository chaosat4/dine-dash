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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyPlatformAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        brandSettings: true,
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            orders: true,
            tables: true,
            menuItems: true,
            categories: true,
          },
        },
      },
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error('Platform restaurant error:', error)
    return NextResponse.json({ error: 'Failed to fetch restaurant' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyPlatformAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        isActive: body.isActive,
        isVerified: body.isVerified,
        subscriptionPlan: body.subscriptionPlan,
        subscriptionEnd: body.subscriptionEnd,
      },
    })

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error('Platform restaurant update error:', error)
    return NextResponse.json({ error: 'Failed to update restaurant' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyPlatformAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only SUPER_ADMIN can delete
    if (admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Delete restaurant and all related data (cascading delete)
    await prisma.restaurant.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Platform restaurant delete error:', error)
    return NextResponse.json({ error: 'Failed to delete restaurant' }, { status: 500 })
  }
}

