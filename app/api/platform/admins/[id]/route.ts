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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentAdmin = await verifyPlatformAdmin()
    if (!currentAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (currentAdmin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const { name, password, role, isActive } = await request.json()

    // Can't modify SUPER_ADMIN
    const target = await prisma.platformAdmin.findUnique({ where: { id } })
    if (target?.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot modify super admin' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { name, role, isActive }
    if (password) {
      updateData.password = Buffer.from(password).toString('base64')
    }

    await prisma.platformAdmin.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Platform admin update error:', error)
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentAdmin = await verifyPlatformAdmin()
    if (!currentAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (currentAdmin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Can't delete SUPER_ADMIN
    const target = await prisma.platformAdmin.findUnique({ where: { id } })
    if (target?.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot delete super admin' }, { status: 400 })
    }

    await prisma.platformAdmin.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Platform admin delete error:', error)
    return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 })
  }
}

