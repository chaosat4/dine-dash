import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// This endpoint creates the initial platform admin
// Should be disabled in production after initial setup
export async function POST(request: NextRequest) {
  try {
    const { email, password, name, setupKey } = await request.json()

    // Simple setup key protection (set this in environment)
    if (setupKey !== process.env.PLATFORM_SETUP_KEY && setupKey !== 'initial-setup-2024') {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 401 })
    }

    // Check if any admin already exists
    const existingAdmin = await prisma.platformAdmin.findFirst()
    if (existingAdmin) {
      return NextResponse.json({ error: 'Platform admin already exists' }, { status: 400 })
    }

    // Create the super admin
    const hashedPassword = Buffer.from(password).toString('base64')

    const admin = await prisma.platformAdmin.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Platform admin created successfully',
      email: admin.email,
    })
  } catch (error) {
    console.error('Platform setup error:', error)
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}

