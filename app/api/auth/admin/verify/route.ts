import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin-session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Decode session token
    const sessionData = JSON.parse(
      Buffer.from(sessionToken, 'base64').toString('utf-8')
    )

    // Check if session is expired
    if (sessionData.exp < Date.now()) {
      cookieStore.delete('admin-session')
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (sessionData.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: sessionData.userId,
        email: sessionData.email,
        role: sessionData.role,
      },
    })
  } catch (error) {
    console.error('Error verifying session:', error)
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    )
  }
}

