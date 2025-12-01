'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingCart, Leaf, Search, X } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { CategoryFilter } from '@/components/menu/CategoryFilter'
import { MenuCard } from '@/components/menu/MenuCard'
import { ItemDetailModal } from '@/components/menu/ItemDetailModal'
import { Header } from '@/components/layout/Header'
import type { Category, MenuItem, Restaurant } from '@/types'

function MenuContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const tableParam = searchParams.get('table')
  
  const { restaurant, setRestaurant, setTable, getCartCount } = useAppStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [vegOnly, setVegOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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

