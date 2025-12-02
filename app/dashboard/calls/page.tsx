'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  RefreshCw,
  Check,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toaster'
import { useStaffStore } from '@/lib/store'

interface WaiterCall {
  id: string
  restaurantId: string
  tableId: string
  table: {
    id: string
    number: number
    name?: string
  }
  reason?: string
  status: 'PENDING' | 'ATTENDED' | 'COMPLETED'
  attendedBy?: string
  attendedAt?: string
  createdAt: string
}

const STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  ATTENDED: 'bg-blue-100 text-blue-800 border-blue-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
}

const STATUS_LABELS = {
  PENDING: 'Waiting',
  ATTENDED: 'Attending',
  COMPLETED: 'Completed',
}

export default function CallsPage() {
  const { restaurantId } = useStaffStore()
  const { addToast } = useToast()
  const [calls, setCalls] = useState<WaiterCall[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING')

  const fetchCalls = useCallback(async () => {
    try {
      const status = filter === 'PENDING' ? 'PENDING,ATTENDED' : ''
      const res = await fetch(`/api/waiter-calls?status=${status}`)
      if (res.ok) {
        const data = await res.json()
        setCalls(data)
      }
    } catch (error) {
      console.error('Error fetching calls:', error)
    }
  }, [filter])

  useEffect(() => {
    fetchCalls()
    // Auto-refresh every 5 seconds for real-time updates
    const interval = setInterval(fetchCalls, 5000)
    return () => clearInterval(interval)
  }, [fetchCalls])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchCalls()
    setIsRefreshing(false)
  }

  const updateCallStatus = async (callId: string, newStatus: 'ATTENDED' | 'COMPLETED') => {
    try {
      const res = await fetch(`/api/waiter-calls/${callId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setCalls((prev) =>
          prev.map((call) =>
            call.id === callId ? { ...call, status: newStatus } : call
          )
        )
        addToast({ 
          title: newStatus === 'ATTENDED' ? 'Attending call' : 'Call completed', 
          type: 'success' 
        })
      } else {
        addToast({ title: 'Failed to update call', type: 'error' })
      }
    } catch {
      addToast({ title: 'Failed to update call', type: 'error' })
    }
  }

  const pendingCalls = calls.filter((c) => c.status === 'PENDING')
  const attendedCalls = calls.filter((c) => c.status === 'ATTENDED')
  const completedCalls = calls.filter((c) => c.status === 'COMPLETED')

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins === 1) return '1 min ago'
    if (diffMins < 60) return `${diffMins} mins ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return '1 hour ago'
    return `${diffHours} hours ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waiter Calls</h1>
          <p className="text-gray-500 mt-1">Respond to customer call requests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'PENDING' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'ALL' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              }`}
            >
              All
            </button>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-900">{pendingCalls.length}</p>
              <p className="text-sm text-amber-700">Waiting</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{attendedCalls.length}</p>
              <p className="text-sm text-blue-700">Attending</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{completedCalls.length}</p>
              <p className="text-sm text-green-700">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Calls - Highlighted */}
      {pendingCalls.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Pending Calls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {pendingCalls.map((call) => (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white border-2 border-amber-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          Table {call.table.number}
                        </span>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-3 h-3 bg-amber-500 rounded-full"
                        />
                      </div>
                      {call.table.name && (
                        <p className="text-sm text-gray-500">{call.table.name}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[call.status]}`}>
                      {STATUS_LABELS[call.status]}
                    </span>
                  </div>
                  
                  {call.reason && (
                    <p className="text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-2">
                      "{call.reason}"
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(call.createdAt)}
                    </span>
                    <span className="font-medium text-amber-600">{getTimeAgo(call.createdAt)}</span>
                  </div>
                  
                  <Button
                    onClick={() => updateCallStatus(call.id, 'ATTENDED')}
                    className="w-full"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Attend Call
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Attended Calls */}
      {attendedCalls.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Currently Attending</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {attendedCalls.map((call) => (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white border border-blue-200 rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        Table {call.table.number}
                      </span>
                      {call.table.name && (
                        <p className="text-sm text-gray-500">{call.table.name}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[call.status]}`}>
                      {STATUS_LABELS[call.status]}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Clock className="w-4 h-4 mr-1" />
                    Called at {formatTime(call.createdAt)}
                  </div>
                  
                  <Button
                    onClick={() => updateCallStatus(call.id, 'COMPLETED')}
                    variant="outline"
                    className="w-full border-green-500 text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark Complete
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Completed Calls (if showing all) */}
      {filter === 'ALL' && completedCalls.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Completed Today</h2>
          <div className="bg-white rounded-2xl border divide-y">
            {completedCalls.slice(0, 10).map((call) => (
              <div key={call.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Table {call.table.number}</span>
                    {call.reason && (
                      <p className="text-sm text-gray-500">{call.reason}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatTime(call.createdAt)}</p>
                  <p className="text-xs text-gray-500">
                    Completed at {call.attendedAt && formatTime(call.attendedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {calls.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No calls yet</h3>
          <p className="text-gray-500">Customer call requests will appear here</p>
        </div>
      )}

      {filter === 'PENDING' && pendingCalls.length === 0 && attendedCalls.length === 0 && calls.length > 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-500">No pending calls at the moment</p>
        </div>
      )}
    </div>
  )
}

