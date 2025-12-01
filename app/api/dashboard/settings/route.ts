import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStaffSession, canAccess } from '@/lib/auth'

export async function GET() {
  try {
    const session = await verifyStaffSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: session.restaurantId },
      include: { brandSettings: true },
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    return NextResponse.json({
      restaurant,
      brandSettings: restaurant.brandSettings,
    })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await verifyStaffSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only owners can modify settings
    if (!canAccess(session.role, 'manage_restaurant')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { type, data } = await request.json()

    if (type === 'general') {
      await prisma.restaurant.update({
        where: { id: session.restaurantId },
        data: {
          name: data.name,
          description: data.description,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
        },
      })
    } else if (type === 'branding') {
      await prisma.brandSettings.update({
        where: { restaurantId: session.restaurantId },
        data: {
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          accentColor: data.accentColor,
          backgroundColor: data.backgroundColor,
          textColor: data.textColor,
          headingFont: data.headingFont,
          bodyFont: data.bodyFont,
          logoUrl: data.logoUrl,
          welcomeMessage: data.welcomeMessage,
          tagline: data.tagline,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

