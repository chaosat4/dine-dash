'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

interface PlatformStats {
  totalRestaurants: number
  activeRestaurants: number
  pendingApprovals: number
  totalOrders: number
  totalRevenue: number
  monthlyGrowth: number
  recentRestaurants: {
    id: string
    name: string
    slug: string
    isActive: boolean
    isVerified: boolean
    createdAt: string
    _count: { orders: number }
  }[]
}

export default function PlatformDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/platform/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Restaurants',
      value: stats?.totalRestaurants || 0,
      icon: Building2,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      label: 'Active Restaurants',
      value: stats?.activeRestaurants || 0,
      icon: CheckCircle2,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Pending Approvals',
      value: stats?.pendingApprovals || 0,
      icon: Clock,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders?.toLocaleString() || 0,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
        <p className="text-slate-400">Monitor and manage all restaurants on the platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Revenue Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 text-white/80 mb-4">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm font-medium">Platform Revenue</span>
          </div>
          <p className="text-4xl font-bold text-white mb-2">
            ₹{((stats?.totalRevenue || 0) / 100000).toFixed(1)}L
          </p>
          <div className="flex items-center gap-2 text-emerald-300">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+{stats?.monthlyGrowth || 0}% this month</span>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-slate-800 rounded-2xl p-6 border border-slate-700"
        >
          <h2 className="font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'View All Restaurants', href: '/platform/restaurants', icon: Building2 },
              { label: 'Pending Approvals', href: '/platform/restaurants?status=pending', icon: Clock },
              { label: 'View Analytics', href: '/platform/analytics', icon: TrendingUp },
              { label: 'Manage Admins', href: '/platform/admins', icon: Users },
            ].map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-center"
                >
                  <Icon className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                  <span className="text-sm text-slate-300">{action.label}</span>
                </Link>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Recent Restaurants */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="font-bold text-white">Recent Restaurants</h2>
          <Link
            href="/platform/restaurants"
            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View all <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr className="text-left text-sm text-slate-400">
                <th className="px-6 py-3 font-medium">Restaurant</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Orders</th>
                <th className="px-6 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {(stats?.recentRestaurants || []).map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-white">{restaurant.name}</p>
                      <p className="text-sm text-slate-500">/r/{restaurant.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {restaurant.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : restaurant.isVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
                        <Clock className="w-3 h-3" />
                        Pending Setup
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400">
                        <AlertCircle className="w-3 h-3" />
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {restaurant._count?.orders || 0}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(restaurant.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!stats?.recentRestaurants || stats.recentRestaurants.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No restaurants yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

