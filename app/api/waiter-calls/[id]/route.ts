import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStaffSession } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyStaffSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    const call = await prisma.waiterCall.update({
      where: { id },
      data: {
        status,
        attendedBy: session.id,
        attendedAt: status === 'ATTENDED' || status === 'COMPLETED' ? new Date() : undefined,
      },
      include: {
        table: true,
      },
    })

    return NextResponse.json(call)
  } catch (error) {
    console.error('Error updating waiter call:', error)
    return NextResponse.json(
      { error: 'Failed to update waiter call' },
      { status: 500 }
    )
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

    const { id } = await params

    await prisma.waiterCall.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting waiter call:', error)
    return NextResponse.json(
      { error: 'Failed to delete waiter call' },
      { status: 500 }
    )
  }
}

