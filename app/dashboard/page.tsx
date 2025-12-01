'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Clock,
  ArrowUpRight,
  ChefHat,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Globe,
  Copy,
  Check,
} from 'lucide-react'
import { useStaffStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import type { DashboardStats, Restaurant } from '@/types'

export default function ManagementDashboard() {
  const { restaurantId } = useStaffStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchData()
  }, [restaurantId, timeRange])

  const fetchData = async () => {
    try {
      const [statsRes, settingsRes] = await Promise.all([
        fetch(`/api/dashboard/stats?range=${timeRange}`),
        fetch('/api/dashboard/settings'),
      ])
      
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setRestaurant(data.restaurant)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const publicUrl = restaurant?.slug 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${restaurant.slug}`
    : ''

  const handleCopyLink = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    {
      label: "Today's Revenue",
      value: formatPrice(stats?.todayRevenue || 0),
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-emerald-500',
    },
    {
      label: "Today's Orders",
      value: stats?.todayOrders || 0,
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingBag,
      color: 'bg-blue-500',
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      change: null,
      trend: null,
      icon: Clock,
      color: 'bg-amber-500',
    },
    {
      label: 'Avg Order Value',
      value: formatPrice(stats?.averageOrderValue || 0),
      change: '+5.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
            Dashboard Overview
          </h1>
          <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
          {(['today', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Preview Link */}
      {restaurant?.slug && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Your Restaurant Page</h2>
                <p className="text-white/80 text-sm">Preview how customers see your restaurant</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                <span className="text-sm text-white/90 truncate max-w-[200px] sm:max-w-[300px]">
                  /r/{restaurant.slug}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-300" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <a
                href={`/r/${restaurant.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Preview
              </a>
            </div>
          </div>
        </motion.div>
      )}

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
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.change && (
                  <span
                    className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-[var(--text)]">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Order Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Pipeline */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-[var(--text)] mb-4">Order Pipeline</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Pending', value: stats?.pendingOrders || 0, color: 'bg-yellow-100 text-yellow-700', icon: Clock },
              { label: 'Preparing', value: 0, color: 'bg-orange-100 text-orange-700', icon: ChefHat },
              { label: 'Completed', value: stats?.completedOrders || 0, color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
              { label: 'Cancelled', value: stats?.cancelledOrders || 0, color: 'bg-red-100 text-red-700', icon: XCircle },
            ].map((status) => {
              const Icon = status.icon
              return (
                <div key={status.label} className={`rounded-xl p-4 ${status.color}`}>
                  <Icon className="w-5 h-5 mb-2" />
                  <p className="text-2xl font-bold">{status.value}</p>
                  <p className="text-sm opacity-80">{status.label}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-[var(--text)] mb-4">Top Selling Items</h2>
          <div className="space-y-3">
            {(stats?.topItems || []).slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text)] truncate">{item.name}</p>
                  <p className="text-sm text-gray-400">{item.count} orders</p>
                </div>
                <span className="text-sm font-medium text-emerald-600">
                  {formatPrice(item.revenue)}
                </span>
              </div>
            ))}
            {(!stats?.topItems || stats.topItems.length === 0) && (
              <p className="text-gray-400 text-center py-8">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[var(--text)]">Recent Orders</h2>
          <a
            href="/dashboard/orders"
            className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            View all <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Table</th>
                <th className="pb-3 font-medium">Items</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {(stats?.recentOrders || []).map((order) => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-4 font-medium text-[var(--text)]">{order.orderNumber}</td>
                  <td className="py-4 text-gray-600">{order.customerName || 'Guest'}</td>
                  <td className="py-4 text-gray-600">Table {order.table?.number}</td>
                  <td className="py-4 text-gray-600">{order.items?.length || 0} items</td>
                  <td className="py-4 font-medium text-[var(--text)]">{formatPrice(order.total)}</td>
                  <td className="py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'PREPARING'
                          ? 'bg-orange-100 text-orange-700'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
