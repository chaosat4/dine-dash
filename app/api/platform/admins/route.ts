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

export async function GET() {
  try {
    const admin = await verifyPlatformAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admins = await prisma.platformAdmin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(admins)
  } catch (error) {
    console.error('Platform admins error:', error)
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentAdmin = await verifyPlatformAdmin()
    if (!currentAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only SUPER_ADMIN can create new admins
    if (currentAdmin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { name, email, password, role } = await request.json()

    // Check if email exists
    const existing = await prisma.platformAdmin.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    // Can't create SUPER_ADMIN
    if (role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot create super admin' }, { status: 400 })
    }

    const hashedPassword = Buffer.from(password).toString('base64')

    const admin = await prisma.platformAdmin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    })

    return NextResponse.json({ id: admin.id }, { status: 201 })
  } catch (error) {
    console.error('Platform admin create error:', error)
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 })
  }
}

