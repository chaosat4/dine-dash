import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStaffSession, canAccess } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyStaffSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canAccess(session.role, 'manage_staff')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const { name, phone, password, role } = await request.json()

    // Verify staff belongs to restaurant
    const existingStaff = await prisma.staff.findFirst({
      where: { id, restaurantId: session.restaurantId },
    })

    if (!existingStaff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    // Can't modify owner
    if (existingStaff.role === 'OWNER') {
      return NextResponse.json({ error: 'Cannot modify owner' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { name, phone, role }
    if (password) {
      updateData.password = Buffer.from(password).toString('base64')
    }

    await prisma.staff.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Staff update error:', error)
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyStaffSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canAccess(session.role, 'manage_staff')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Verify staff belongs to restaurant
    const existingStaff = await prisma.staff.findFirst({
      where: { id, restaurantId: session.restaurantId },
    })

    if (!existingStaff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    // Can't delete owner
    if (existingStaff.role === 'OWNER') {
      return NextResponse.json({ error: 'Cannot delete owner' }, { status: 400 })
    }

    await prisma.staff.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Staff delete error:', error)
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 })
  }
}

