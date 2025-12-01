'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Building2,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  X,
  Power,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toaster'
import type { Restaurant } from '@/types'

function RestaurantsContent() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('status') || 'all'
  const { addToast } = useToast()
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchRestaurants()
  }, [statusFilter])

  const fetchRestaurants = async () => {
    try {
      const res = await fetch(`/api/platform/restaurants?status=${statusFilter}`)
      if (res.ok) {
        const data = await res.json()
        setRestaurants(data)
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (restaurant: Restaurant) => {
    try {
      const res = await fetch(`/api/platform/restaurants/${restaurant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !restaurant.isActive }),
      })

      if (res.ok) {
        setRestaurants((prev) =>
          prev.map((r) =>
            r.id === restaurant.id ? { ...r, isActive: !r.isActive } : r
          )
        )
        addToast({
          title: restaurant.isActive ? 'Restaurant deactivated' : 'Restaurant activated',
          type: 'success',
        })
      }
    } catch (error) {
      addToast({ title: 'Failed to update restaurant', type: 'error' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/platform/restaurants/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setRestaurants((prev) => prev.filter((r) => r.id !== id))
        addToast({ title: 'Restaurant deleted', type: 'success' })
      }
    } catch (error) {
      addToast({ title: 'Failed to delete restaurant', type: 'error' })
    }
  }

  const filteredRestaurants = restaurants.filter((r) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        r.name.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query) ||
        r.slug.toLowerCase().includes(query)
      )
    }
    return true
  })

  const getStatusBadge = (restaurant: Restaurant) => {
    if (restaurant.isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="w-3 h-3" />
          Active
        </span>
      )
    }
    if (restaurant.isVerified) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
        <XCircle className="w-3 h-3" />
        Inactive
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Restaurants</h1>
            <p className="text-slate-400">Manage all restaurants on the platform</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Restaurants Table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr className="text-left text-sm text-slate-400">
                <th className="px-6 py-4 font-medium">Restaurant</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{restaurant.name}</p>
                        <p className="text-sm text-slate-500">/r/{restaurant.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-300">{restaurant.email}</p>
                    <p className="text-sm text-slate-500">{restaurant.phone}</p>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(restaurant)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                      {restaurant.subscriptionPlan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(restaurant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedRestaurant(restaurant)
                          setShowDetailModal(true)
                        }}
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={`/r/${restaurant.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
                        title="Open Restaurant"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleToggleActive(restaurant)}
                        className={`p-2 hover:bg-slate-700 rounded-lg ${
                          restaurant.isActive ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                        title={restaurant.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(restaurant.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRestaurants.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No restaurants found</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowDetailModal(false)}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700"
          >
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{selectedRestaurant.name}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-slate-700 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedRestaurant)}
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400">
                  {selectedRestaurant.subscriptionPlan}
                </span>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-xl">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm text-white">{selectedRestaurant.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-xl">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm text-white">{selectedRestaurant.phone}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              {selectedRestaurant.address && (
                <div className="flex items-start gap-3 p-4 bg-slate-700/50 rounded-xl">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-sm text-white">
                      {selectedRestaurant.address}
                      {selectedRestaurant.city && `, ${selectedRestaurant.city}`}
                      {selectedRestaurant.state && `, ${selectedRestaurant.state}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <a
                  href={`/r/${selectedRestaurant.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Restaurant
                  </Button>
                </a>
                <Button
                  onClick={() => handleToggleActive(selectedRestaurant)}
                  variant={selectedRestaurant.isActive ? 'danger' : 'primary'}
                  className="flex-1"
                >
                  <Power className="w-4 h-4 mr-2" />
                  {selectedRestaurant.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default function RestaurantsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RestaurantsContent />
    </Suspense>
  )
}

