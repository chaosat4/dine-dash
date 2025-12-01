import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('platform-session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = JSON.parse(
      Buffer.from(sessionToken, 'base64').toString('utf-8')
    )

    if (session.exp < Date.now()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    return NextResponse.json({
      id: session.id,
      email: session.email,
      name: session.name,
      role: session.role,
    })
  } catch (error) {
    console.error('Platform verify error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

