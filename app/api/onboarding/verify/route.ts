import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createStaffSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    // Find OTP
    const otp = await prisma.oTP.findFirst({
      where: {
        phone: email,
        code,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otp) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    // Find staff and restaurant
    const staff = await prisma.staff.findUnique({
      where: { email },
      include: { restaurant: true },
    })

    if (!staff) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Update OTP as verified and restaurant as verified
    await prisma.$transaction([
      prisma.oTP.update({
        where: { id: otp.id },
        data: { verified: true },
      }),
      prisma.restaurant.update({
        where: { id: staff.restaurantId },
        data: { isVerified: true },
      }),
    ])

    // Create session
    const sessionToken = await createStaffSession({
      id: staff.id,
      restaurantId: staff.restaurantId,
      email: staff.email,
      name: staff.name,
      role: staff.role,
    })

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('staff-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    })

    return NextResponse.json({
      success: true,
      restaurantId: staff.restaurantId,
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

