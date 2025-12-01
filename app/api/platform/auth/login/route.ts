import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const admin = await prisma.platformAdmin.findUnique({
      where: { email },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Simple password check (use bcrypt in production)
    const hashedInput = Buffer.from(password).toString('base64')
    if (admin.password !== hashedInput) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (!admin.isActive) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 })
    }

    // Update last login
    await prisma.platformAdmin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    })

    // Create session
    const session = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }

    const sessionToken = Buffer.from(JSON.stringify(session)).toString('base64')

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('platform-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      name: admin.name,
      role: admin.role,
    })
  } catch (error) {
    console.error('Platform login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

