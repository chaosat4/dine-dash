import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code, restaurantId } = body

    if (!phone || !code || !restaurantId) {
      return NextResponse.json(
        { error: 'Phone, OTP code, and restaurantId are required' },
        { status: 400 }
      )
    }

    // Find the most recent unexpired OTP for this phone
    const otp = await prisma.oTP.findFirst({
      where: {
        phone,
        code,
        expiresAt: { gt: new Date() },
        verified: false,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otp) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Mark OTP as verified
    await prisma.oTP.update({
      where: { id: otp.id },
      data: { verified: true },
    })

    // Create or update customer
    let customer = await prisma.customer.findUnique({
      where: { restaurantId_phone: { restaurantId, phone } },
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          restaurantId,
          phone,
          verified: true,
        },
      })
    } else {
      customer = await prisma.customer.update({
        where: { restaurantId_phone: { restaurantId, phone } },
        data: { verified: true },
      })
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        phone: customer.phone,
        name: customer.name,
        verified: customer.verified,
      },
    })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}

