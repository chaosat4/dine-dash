import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('platform-session')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Platform logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}

