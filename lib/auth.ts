import { cookies } from 'next/headers'

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin-session')?.value

    if (!sessionToken) {
      return false
    }

    // Decode session token
    const sessionData = JSON.parse(
      Buffer.from(sessionToken, 'base64').toString('utf-8')
    )

    // Check if session is expired
    if (sessionData.exp < Date.now()) {
      return false
    }

    // Check if user is admin
    return sessionData.role === 'ADMIN'
  } catch (error) {
    console.error('Error verifying admin session:', error)
    return false
  }
}

export async function getAdminSession() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin-session')?.value

    if (!sessionToken) {
      return null
    }

    // Decode session token
    const sessionData = JSON.parse(
      Buffer.from(sessionToken, 'base64').toString('utf-8')
    )

    // Check if session is expired
    if (sessionData.exp < Date.now()) {
      return null
    }

    return sessionData
  } catch (error) {
    console.error('Error getting admin session:', error)
    return null
  }
}

