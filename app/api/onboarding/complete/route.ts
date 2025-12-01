import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStaffSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await verifyStaffSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      restaurantId,
      primaryColor,
      secondaryColor,
      accentColor,
      headingFont,
      bodyFont,
      logoUrl,
      welcomeMessage,
      tagline,
      tableCount,
      tablePrefix,
    } = body

    // Verify restaurant belongs to user
    if (session.restaurantId !== restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update brand settings (separate query - no transaction)
    await prisma.brandSettings.update({
      where: { restaurantId },
      data: {
        primaryColor,
        secondaryColor,
        accentColor,
        headingFont,
        bodyFont,
        logoUrl,
        welcomeMessage,
        tagline,
      },
    })

    // Create tables one by one to avoid transaction timeout
    for (let i = 0; i < tableCount; i++) {
      await prisma.table.create({
        data: {
          restaurantId,
          number: i + 1,
          name: `${tablePrefix} ${i + 1}`,
          capacity: 4,
          isActive: true,
        },
      })
    }

    // Update restaurant to active
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        isActive: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Setup completion error:', error)
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}
