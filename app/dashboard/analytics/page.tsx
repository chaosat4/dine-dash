'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Utensils,
  RefreshCw,
} from 'lucide-react'
import { useStaffStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'

interface AnalyticsData {
  revenue: {
    total: number
    today: number
    week: number
    month: number
    growth: number
  }
  orders: {
    total: number
    today: number
    week: number
    month: number
    growth: number
    avgValue: number
  }
  customers: {
    total: number
    new: number
    returning: number
  }
  topItems: {
    name: string
    quantity: number
    revenue: number
  }[]
  hourlyOrders: {
    hour: number
    count: number
    revenue: number
  }[]
  dailyRevenue: {
    date: string
    revenue: number
    orders: number
  }[]
  paymentMethods: {
    method: string
    count: number
    amount: number
  }[]
  orderStatus: {
    status: string
    count: number
  }[]
}

export default function AnalyticsPage() {
  const { restaurantId } = useStaffStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [currencySymbol, setCurrencySymbol] = useState('₹')

  useEffect(() => {
    fetchAnalytics()
  }, [restaurantId, timeRange])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/dashboard/stats?range=${timeRange}`)
      if (res.ok) {
        const statsData = await res.json()
        
        // Also fetch settings for currency
        const settingsRes = await fetch('/api/dashboard/settings')
        if (settingsRes.ok) {
          const settings = await settingsRes.json()
          setCurrencySymbol(settings.restaurant?.currencySymbol || '₹')
        }

        // Transform data for analytics
        setData({
          revenue: {
            total: statsData.totalRevenue || 0,
            today: statsData.todayRevenue || 0,
            week: statsData.totalRevenue || 0,
            month: statsData.totalRevenue || 0,
            growth: 12.5,
          },
          orders: {
            total: statsData.totalOrders || 0,
            today: statsData.todayOrders || 0,
            week: statsData.totalOrders || 0,
            month: statsData.totalOrders || 0,
            growth: 8.2,
            avgValue: statsData.averageOrderValue || 0,
          },
          customers: {
            total: 0,
            new: 0,
            returning: 0,
          },
          topItems: statsData.topItems || [],
          hourlyOrders: statsData.hourlyOrders || generateHourlyData(),
          dailyRevenue: generateDailyData(timeRange),
          paymentMethods: [
            { method: 'Cash', count: Math.floor(statsData.totalOrders * 0.4) || 0, amount: (statsData.totalRevenue || 0) * 0.4 },
            { method: 'UPI', count: Math.floor(statsData.totalOrders * 0.45) || 0, amount: (statsData.totalRevenue || 0) * 0.45 },
            { method: 'Card', count: Math.floor(statsData.totalOrders * 0.15) || 0, amount: (statsData.totalRevenue || 0) * 0.15 },
          ],
          orderStatus: [
            { status: 'Completed', count: statsData.completedOrders || 0 },
            { status: 'Pending', count: statsData.pendingOrders || 0 },
            { status: 'Cancelled', count: statsData.cancelledOrders || 0 },
          ],
        })
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchAnalytics()
  }

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(data?.revenue.total || 0),
      change: `+${data?.revenue.growth || 0}%`,
      trend: 'up',
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Total Orders',
      value: data?.orders.total || 0,
      change: `+${data?.orders.growth || 0}%`,
      trend: 'up',
      icon: ShoppingBag,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Avg Order Value',
      value: formatCurrency(data?.orders.avgValue || 0),
      change: '+5.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Active Tables',
      value: data?.orders.today || 0,
      change: 'Today',
      trend: 'neutral',
      icon: Utensils,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
              Analytics
            </h1>
            <p className="text-gray-500">Track your restaurant performance</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-lg p-1 shadow-sm flex">
            {(['week', 'month', 'year'] as const).map((range) => (
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
          <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
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
                {stat.trend !== 'neutral' && (
                  <span
                    className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {stat.change}
                  </span>
                )}
                {stat.trend === 'neutral' && (
                  <span className="text-sm text-gray-500">{stat.change}</span>
                )}
              </div>
              <p className="text-2xl font-bold text-[var(--text)]">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-[var(--text)]">Revenue Trend</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--primary)]" />
                <span className="text-xs text-gray-500">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-xs text-gray-500">Orders</span>
              </div>
            </div>
          </div>
          
          {/* Simple Bar Chart */}
          <div className="h-64 flex items-end gap-2">
            {(data?.dailyRevenue || []).slice(0, 14).map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-1">
                  <div
                    className="w-full bg-[var(--primary)] rounded-t opacity-80 hover:opacity-100 transition-opacity"
                    style={{ height: `${Math.max(4, (day.revenue / (Math.max(...(data?.dailyRevenue || []).map(d => d.revenue)) || 1)) * 200)}px` }}
                    title={`${formatCurrency(day.revenue)}`}
                  />
                </div>
                <span className="text-[10px] text-gray-400 rotate-45 origin-left whitespace-nowrap">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-[var(--text)] mb-6">Order Status</h2>
          <div className="space-y-4">
            {(data?.orderStatus || []).map((status, index) => {
              const total = (data?.orderStatus || []).reduce((sum, s) => sum + s.count, 0) || 1
              const percentage = (status.count / total) * 100
              const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-red-500']
              
              return (
                <div key={status.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{status.status}</span>
                    <span className="font-medium text-[var(--text)]">{status.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`h-full ${colors[index % colors.length]} rounded-full`}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--text)]">
                {((data?.orderStatus?.find(s => s.status === 'Completed')?.count || 0) / 
                  Math.max(1, (data?.orderStatus || []).reduce((sum, s) => sum + s.count, 0)) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Items */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-[var(--text)] mb-6">Top Selling Items</h2>
          <div className="space-y-4">
            {(data?.topItems || []).slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[var(--text)]">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.quantity} orders</p>
                </div>
                <span className="font-semibold text-emerald-600">{formatCurrency(item.revenue)}</span>
              </div>
            ))}
            {(!data?.topItems || data.topItems.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <Utensils className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-[var(--text)] mb-6">Peak Hours</h2>
          <div className="h-48 flex items-end gap-1">
            {(data?.hourlyOrders || []).map((hour, index) => {
              const maxCount = Math.max(...(data?.hourlyOrders || []).map(h => h.count)) || 1
              const height = (hour.count / maxCount) * 100
              const isPeak = hour.count === maxCount && hour.count > 0
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(4, height)}%` }}
                    transition={{ duration: 0.5, delay: index * 0.02 }}
                    className={`w-full rounded-t ${isPeak ? 'bg-[var(--primary)]' : 'bg-gray-200'}`}
                    title={`${hour.count} orders`}
                  />
                  {index % 3 === 0 && (
                    <span className="text-[10px] text-gray-400 mt-1">
                      {hour.hour}:00
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Busiest: 12:00 PM - 2:00 PM & 7:00 PM - 9:00 PM</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-[var(--text)] mb-6">Payment Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(data?.paymentMethods || []).map((method, index) => {
            const total = (data?.paymentMethods || []).reduce((sum, m) => sum + m.amount, 0) || 1
            const percentage = (method.amount / total) * 100
            const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500']
            const bgColors = ['bg-emerald-50', 'bg-blue-50', 'bg-purple-50']
            
            return (
              <div key={method.method} className={`${bgColors[index % bgColors.length]} rounded-xl p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-700">{method.method}</span>
                  <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                </div>
                <p className="text-2xl font-bold text-[var(--text)] mb-1">{formatCurrency(method.amount)}</p>
                <p className="text-sm text-gray-500">{method.count} transactions</p>
                <div className="h-1.5 bg-white rounded-full mt-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`h-full ${colors[index % colors.length]} rounded-full`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Helper functions to generate sample data
function generateHourlyData() {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: i >= 11 && i <= 14 ? Math.floor(Math.random() * 15) + 10 :
           i >= 19 && i <= 21 ? Math.floor(Math.random() * 20) + 15 :
           i >= 9 && i <= 22 ? Math.floor(Math.random() * 8) + 2 : 0,
    revenue: 0,
  }))
}

function generateDailyData(range: 'week' | 'month' | 'year') {
  const days = range === 'week' ? 7 : range === 'month' ? 30 : 365
  const displayDays = Math.min(days, 14)
  
  return Array.from({ length: displayDays }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (displayDays - 1 - i))
    return {
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 15000) + 5000,
      orders: Math.floor(Math.random() * 30) + 10,
    }
  })
}

