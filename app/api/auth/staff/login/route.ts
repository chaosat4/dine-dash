import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createStaffSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const staff = await prisma.staff.findUnique({
      where: { email },
      include: { restaurant: true },
    })

    if (!staff) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Simple password check (use bcrypt in production)
    const hashedInput = Buffer.from(password).toString('base64')
    if (staff.password !== hashedInput) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (!staff.isActive) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 })
    }

    if (!staff.restaurant.isActive) {
      return NextResponse.json({ error: 'Restaurant is not active' }, { status: 401 })
    }

    // Update last login
    await prisma.staff.update({
      where: { id: staff.id },
      data: { lastLogin: new Date() },
    })

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
      staffId: staff.id,
      restaurantId: staff.restaurantId,
      name: staff.name,
      role: staff.role,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

