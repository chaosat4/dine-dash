import { NextResponse } from 'next/server'
import { verifyStaffSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await verifyStaffSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      staffId: session.id,
      restaurantId: session.restaurantId,
      name: session.name,
      email: session.email,
      role: session.role,
    })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

