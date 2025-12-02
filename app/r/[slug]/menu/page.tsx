'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingCart, Leaf, Search, X, Bell, Phone } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { CategoryFilter } from '@/components/menu/CategoryFilter'
import { MenuCard } from '@/components/menu/MenuCard'
import { ItemDetailModal } from '@/components/menu/ItemDetailModal'
import { Header } from '@/components/layout/Header'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toaster'
import type { Category, MenuItem, Restaurant } from '@/types'

function MenuContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const tableParam = searchParams.get('table')
  
  const { restaurant, setRestaurant, setTable, getCartCount, tableId, user, setUser } = useAppStore()
  const { addToast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [vegOnly, setVegOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isCallingWaiter, setIsCallingWaiter] = useState(false)
  const [waiterCalled, setWaiterCalled] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch restaurant if not in store
        if (!restaurant || restaurant.slug !== slug) {
          const restaurantRes = await fetch(`/api/restaurants/${slug}`)
          if (restaurantRes.ok) {
            const data = await restaurantRes.json()
            setRestaurant(data)
          }
        }

        // Fetch menu
        const menuRes = await fetch(`/api/restaurants/${slug}/menu`)
        if (menuRes.ok) {
          const data = await menuRes.json()
          setCategories(data)
        }

        // Set table from URL param
        if (tableParam) {
          const tablesRes = await fetch(`/api/tables?restaurantId=${restaurant?.id}`)
          if (tablesRes.ok) {
            const tables = await tablesRes.json()
            const table = tables.find((t: { id: string }) => t.id === tableParam)
            if (table) {
              setTable(table.id, table.number)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [slug, tableParam, restaurant, setRestaurant, setTable])

  const filteredItems = categories.flatMap((category) => {
    if (selectedCategory !== null && category.id !== selectedCategory) {
      return []
    }
    return (category.items || []).filter((item) => {
      if (vegOnly && !item.isVeg) return false
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      return true
    }).map((item) => ({ ...item, category }))
  })

  const cartCount = getCartCount()
  const brandSettings = restaurant?.brandSettings
  
  // Check if user can call waiter (has phone number or is verified)
  const canCallWaiter = (user?.phone && user.phone.length >= 10) || user?.verified === true
  
  const handleCallWaiter = async () => {
    if (!restaurant?.id || !tableId) {
      addToast({ title: 'Please scan a table QR code first', type: 'error' })
      return
    }

    // If user doesn't have phone number, show modal to collect it
    if (!canCallWaiter) {
      setShowPhoneModal(true)
      return
    }

    setIsCallingWaiter(true)
    try {
      const res = await fetch('/api/waiter-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          tableId: tableId,
          reason: 'Assistance requested',
        }),
      })

      if (res.ok) {
        setWaiterCalled(true)
        addToast({ title: 'Waiter has been called!', type: 'success' })
        // Reset after 30 seconds to allow calling again
        setTimeout(() => setWaiterCalled(false), 30000)
      } else {
        const data = await res.json()
        if (data.existing) {
          setWaiterCalled(true)
          addToast({ title: 'Waiter already called for your table', type: 'info' })
        } else {
          addToast({ title: 'Failed to call waiter', type: 'error' })
        }
      }
    } catch {
      addToast({ title: 'Failed to call waiter', type: 'error' })
    } finally {
      setIsCallingWaiter(false)
    }
  }

  const handleSavePhoneAndCall = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      addToast({ title: 'Please enter a valid phone number', type: 'error' })
      return
    }

    if (!restaurant?.id || !tableId) {
      addToast({ title: 'Please scan a table QR code first', type: 'error' })
      return
    }

    // Save phone number to store
    setUser({
      phone: phoneNumber,
      verified: false,
    })
    
    setShowPhoneModal(false)
    setIsCallingWaiter(true)
    
    try {
      const res = await fetch('/api/waiter-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          tableId: tableId,
          reason: 'Assistance requested',
        }),
      })

      if (res.ok) {
        setWaiterCalled(true)
        addToast({ title: 'Waiter has been called!', type: 'success' })
        setTimeout(() => setWaiterCalled(false), 30000)
      } else {
        const data = await res.json()
        if (data.existing) {
          setWaiterCalled(true)
          addToast({ title: 'Waiter already called for your table', type: 'info' })
        } else {
          addToast({ title: 'Failed to call waiter', type: 'error' })
        }
      }
    } catch {
      addToast({ title: 'Failed to call waiter', type: 'error' })
    } finally {
      setIsCallingWaiter(false)
      setPhoneNumber('')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div 
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: brandSettings?.primaryColor || 'var(--primary)' }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header title={restaurant?.name} />
      
      {/* Welcome Banner */}
      {brandSettings?.welcomeMessage && (
        <div 
          className="px-4 py-3 text-center text-white"
          style={{ backgroundColor: brandSettings.primaryColor }}
        >
          <p className="text-sm">{brandSettings.welcomeMessage}</p>
        </div>
      )}

      {/* Search & Filters */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
              vegOnly ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200'
            }`}
          >
            <Leaf className="w-4 h-4" />
            <span className="text-sm font-medium">Veg</span>
          </button>
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Menu Items */}
      <div className="p-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MenuCard
                item={item}
                onSelect={() => setSelectedItem(item)}
              />
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No items found</p>
          </div>
        )}
      </div>

      {/* Call Waiter Button - Fixed Bottom Right */}
      {tableId && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={handleCallWaiter}
          disabled={isCallingWaiter || waiterCalled}
          className={`fixed right-4 z-30 w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
            cartCount > 0 ? 'bottom-24' : 'bottom-4'
          }`}
          style={{ backgroundColor: waiterCalled ? '#10b981' : (brandSettings?.primaryColor || 'var(--primary)') }}
          title={waiterCalled ? 'Waiter called!' : 'Call Waiter'}
        >
          {waiterCalled ? (
            <X className="w-6 h-6" />
          ) : (
            <Bell className="w-6 h-6" />
          )}
        </motion.button>
      )}

      {/* Cart Button */}
      {cartCount > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-4 left-4 right-4 z-30"
        >
          <a
            href={`/r/${slug}/cart`}
            className="flex items-center justify-between w-full px-6 py-4 rounded-2xl text-white shadow-lg"
            style={{ backgroundColor: brandSettings?.primaryColor || 'var(--primary)' }}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6" />
              <span className="font-semibold">{cartCount} items</span>
            </div>
            <span className="font-bold">View Cart</span>
          </a>
        </motion.div>
      )}

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Phone Number Modal */}
      <Modal
        open={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        title="Enter Phone Number"
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Please provide your phone number to call a waiter.
          </p>
          <Input
            label="Phone Number *"
            placeholder="10-digit mobile number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            icon={<Phone className="w-5 h-5" />}
            required
          />
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSavePhoneAndCall}
              className="flex-1"
              disabled={!phoneNumber || phoneNumber.length < 10}
              style={{ backgroundColor: brandSettings?.primaryColor || 'var(--primary)' }}
            >
              Save & Call Waiter
            </Button>
            <Button
              onClick={() => setShowPhoneModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MenuContent />
    </Suspense>
  )
}

