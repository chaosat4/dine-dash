'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  BarChart3,
  CreditCard,
  Shield,
  Menu,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { href: '/platform', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/platform/restaurants', label: 'Restaurants', icon: Building2 },
  { href: '/platform/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/platform/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/platform/admins', label: 'Platform Admins', icon: Users },
  { href: '/platform/settings', label: 'Settings', icon: Settings },
]

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [adminName, setAdminName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/platform/auth/verify')
      if (res.ok) {
        const data = await res.json()
        setAdminName(data.name)
      } else {
        router.push('/platform/login')
      }
    } catch (error) {
      router.push('/platform/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/platform/auth/logout', { method: 'POST' })
    router.push('/platform/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (pathname === '/platform/login') {
    return children
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-slate-800 border-r border-slate-700">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white">Dine & Dash</h1>
            <p className="text-xs text-slate-400">Platform Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="font-bold text-white">
                {adminName?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{adminName}</p>
              <p className="text-xs text-slate-400">Platform Admin</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
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
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            className="relative w-72 bg-slate-800 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">Platform Admin</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-slate-700">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-slate-700 rounded-xl"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-400 hover:bg-slate-700 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-white">
            {navItems.find((i) => i.href === pathname)?.label || 'Platform Admin'}
          </h1>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

