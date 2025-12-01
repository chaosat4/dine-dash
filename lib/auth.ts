import { cookies } from 'next/headers'

export interface SessionData {
  id: string
  restaurantId: string
  email: string
  name: string
  role: 'OWNER' | 'MANAGER' | 'CHEF' | 'WAITER'
  exp: number
}

export async function verifyStaffSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('staff-session')?.value

    if (!sessionToken) {
      return null
    }

    const sessionData: SessionData = JSON.parse(
      Buffer.from(sessionToken, 'base64').toString('utf-8')
    )

    if (sessionData.exp < Date.now()) {
      return null
    }

    return sessionData
  } catch (error) {
    console.error('Error verifying staff session:', error)
    return null
  }
}

export async function getStaffSession(): Promise<SessionData | null> {
  return verifyStaffSession()
}

export async function createStaffSession(data: Omit<SessionData, 'exp'>): Promise<string> {
  const session: SessionData = {
    ...data,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }
  return Buffer.from(JSON.stringify(session)).toString('base64')
}

export function hasPermission(
  role: SessionData['role'],
  requiredRoles: SessionData['role'][]
): boolean {
  return requiredRoles.includes(role)
}

// Role hierarchy for permission checks
export const ROLE_PERMISSIONS = {
  OWNER: ['manage_restaurant', 'manage_staff', 'view_analytics', 'manage_menu', 'manage_orders', 'manage_tables', 'kitchen', 'waiter'],
  MANAGER: ['view_analytics', 'manage_menu', 'manage_orders', 'manage_tables', 'kitchen', 'waiter'],
  CHEF: ['kitchen', 'view_orders'],
  WAITER: ['waiter', 'view_orders'],
} as const

export function canAccess(role: SessionData['role'], permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.includes(permission as typeof permissions[number])
}

// Legacy support - will be deprecated
export async function verifyAdminSession(): Promise<boolean> {
  const session = await verifyStaffSession()
  return session !== null && (session.role === 'OWNER' || session.role === 'MANAGER')
}

export async function getAdminSession() {
  return verifyStaffSession()
}
