import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStaffSession } from '@/lib/auth'

interface TaxItem {
  id: string
  name: string
  rate: number
  isActive: boolean
}

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
      // Currency & Tax
      currency,
      currencySymbol,
      taxEnabled,
      taxInclusive,
      taxes,
      // Tables
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

    // Update restaurant with currency and tax settings
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        currency: currency || 'INR',
        currencySymbol: currencySymbol || '₹',
        taxEnabled: taxEnabled ?? true,
        taxInclusive: taxInclusive ?? false,
        isActive: true,
      },
    })

    // Create tax settings if taxes are provided
    if (taxes && Array.isArray(taxes)) {
      // Delete existing tax settings
      await prisma.taxSetting.deleteMany({
        where: { restaurantId },
      })

      // Create new tax settings
      for (const tax of taxes as TaxItem[]) {
        if (tax.name && tax.rate > 0) {
          await prisma.taxSetting.create({
            data: {
              restaurantId,
              name: tax.name,
              rate: tax.rate,
              isActive: tax.isActive,
              isDefault: false,
            },
          })
        }
      }
    }

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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Setup completion error:', error)
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}
