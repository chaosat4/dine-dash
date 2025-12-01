import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStaffSession, canAccess } from '@/lib/auth'

export async function GET() {
  try {
    const session = await verifyStaffSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canAccess(session.role, 'manage_staff')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const staff = await prisma.staff.findMany({
      where: { restaurantId: session.restaurantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Staff fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyStaffSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canAccess(session.role, 'manage_staff')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { name, email, phone, password, role } = await request.json()

    // Check if email already exists
    const existing = await prisma.staff.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    // Can't create another owner
    if (role === 'OWNER') {
      return NextResponse.json({ error: 'Cannot create another owner' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = Buffer.from(password).toString('base64')

    const staff = await prisma.staff.create({
      data: {
        restaurantId: session.restaurantId,
        name,
        email,
        phone,
        password: hashedPassword,
        role,
      },
    })

    return NextResponse.json({ id: staff.id }, { status: 201 })
  } catch (error) {
    console.error('Staff create error:', error)
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 })
  }
}

