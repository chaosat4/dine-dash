'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  UtensilsCrossed,
  LayoutDashboard,
  ChefHat,
  ConciergeBell,
  Menu,
  Settings,
  LogOut,
  Users,
  BarChart3,
  Utensils,
  TableIcon,
  QrCode,
  ChevronDown,
  X,
  Receipt,
} from 'lucide-react'
import { useStaffStore } from '@/lib/store'
import type { StaffRole } from '@/types'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles: StaffRole[]
  badge?: number
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['OWNER', 'MANAGER'] },
  { href: '/dashboard/orders', label: 'Orders', icon: ConciergeBell, roles: ['OWNER', 'MANAGER', 'WAITER'] },
  { href: '/dashboard/kitchen', label: 'Kitchen', icon: ChefHat, roles: ['OWNER', 'MANAGER', 'CHEF'] },
  { href: '/dashboard/menu', label: 'Menu', icon: Utensils, roles: ['OWNER', 'MANAGER'] },
  { href: '/dashboard/tables', label: 'Tables', icon: TableIcon, roles: ['OWNER', 'MANAGER'] },
  { href: '/dashboard/qr-codes', label: 'QR Codes', icon: QrCode, roles: ['OWNER', 'MANAGER'] },
  { href: '/dashboard/invoices', label: 'Invoices', icon: Receipt, roles: ['OWNER', 'MANAGER'] },
  { href: '/dashboard/staff', label: 'Staff', icon: Users, roles: ['OWNER', 'MANAGER'] },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, roles: ['OWNER', 'MANAGER'] },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['OWNER'] },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { staffId, staffName, role, restaurantId, clearStaff } = useStaffStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/staff/verify')
        if (!res.ok) {
          router.push('/dashboard/login')
          return
        }
        const data = await res.json()
        // Sync store with session
        if (data.staffId && data.restaurantId) {
          useStaffStore.setState({
            staffId: data.staffId,
            restaurantId: data.restaurantId,
            staffName: data.name,
            role: data.role,
          })
        }
      } catch (error) {
        router.push('/dashboard/login')
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/staff/logout', { method: 'POST' })
      clearStaff()
      router.push('/dashboard/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const filteredNavItems = navItems.filter(
    (item) => role && item.roles.includes(role)
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (pathname === '/dashboard/login') {
    return children
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-[var(--text)]">Dine & Dash</h1>
            <p className="text-xs text-gray-400">Restaurant Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="font-bold text-gray-600">
                {staffName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--text)] truncate">{staffName}</p>
              <p className="text-xs text-gray-400 capitalize">{role?.toLowerCase()}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="relative w-72 bg-white flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5 text-white" />
                </div>
                <h1 className="font-bold text-[var(--text)]">Dine & Dash</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {filteredNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[var(--primary)] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-[var(--text)]">
              {filteredNavItems.find((i) => i.href === pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-600">
              {staffName?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

