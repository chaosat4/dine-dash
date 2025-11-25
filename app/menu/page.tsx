'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { MenuCard } from '@/components/menu/MenuCard'
import { CategoryFilter } from '@/components/menu/CategoryFilter'
import { ItemDetailModal } from '@/components/menu/ItemDetailModal'
import { useAppStore } from '@/lib/store'
import { Input } from '@/components/ui/Input'
import type { MenuItem, Category } from '@/types'

// Demo data
const demoCategories: Category[] = [
  { id: '1', name: 'Starters', sortOrder: 1, isActive: true },
  { id: '2', name: 'Main Course', sortOrder: 2, isActive: true },
  { id: '3', name: 'Biryani', sortOrder: 3, isActive: true },
  { id: '4', name: 'Breads', sortOrder: 4, isActive: true },
  { id: '5', name: 'Desserts', sortOrder: 5, isActive: true },
  { id: '6', name: 'Beverages', sortOrder: 6, isActive: true },
]

const demoItems: MenuItem[] = [
  { id: '1', name: 'Paneer Tikka', description: 'Marinated cottage cheese grilled to perfection with spices', price: 299, isVeg: true, isAvailable: true, categoryId: '1', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400' },
  { id: '2', name: 'Chicken 65', description: 'Spicy deep-fried chicken with curry leaves and chilies', price: 349, isVeg: false, isAvailable: true, categoryId: '1', image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400' },
  { id: '3', name: 'Veg Manchurian', description: 'Crispy vegetable balls in tangy manchurian sauce', price: 249, isVeg: true, isAvailable: true, categoryId: '1' },
  { id: '4', name: 'Butter Chicken', description: 'Tender chicken in rich tomato and butter gravy', price: 399, isVeg: false, isAvailable: true, categoryId: '2', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
  { id: '5', name: 'Palak Paneer', description: 'Cottage cheese cubes in creamy spinach gravy', price: 329, isVeg: true, isAvailable: true, categoryId: '2', image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400' },
  { id: '6', name: 'Dal Makhani', description: 'Slow-cooked black lentils in creamy tomato gravy', price: 279, isVeg: true, isAvailable: true, categoryId: '2' },
  { id: '7', name: 'Chicken Biryani', description: 'Aromatic basmati rice with tender chicken and spices', price: 399, isVeg: false, isAvailable: true, categoryId: '3', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
  { id: '8', name: 'Veg Biryani', description: 'Fragrant rice with mixed vegetables and dum cooking', price: 299, isVeg: true, isAvailable: true, categoryId: '3' },
  { id: '9', name: 'Butter Naan', description: 'Soft leavened bread brushed with butter', price: 69, isVeg: true, isAvailable: true, categoryId: '4' },
  { id: '10', name: 'Garlic Naan', description: 'Naan topped with fresh garlic and coriander', price: 79, isVeg: true, isAvailable: true, categoryId: '4' },
  { id: '11', name: 'Gulab Jamun', description: 'Soft milk dumplings soaked in rose-flavored syrup', price: 149, isVeg: true, isAvailable: true, categoryId: '5', image: 'https://images.unsplash.com/photo-1666190050431-e564928cb9b2?w=400' },
  { id: '12', name: 'Rasmalai', description: 'Soft cheese patties in saffron-flavored milk', price: 169, isVeg: true, isAvailable: true, categoryId: '5' },
  { id: '13', name: 'Masala Chai', description: 'Traditional Indian spiced tea', price: 49, isVeg: true, isAvailable: true, categoryId: '6' },
  { id: '14', name: 'Mango Lassi', description: 'Creamy yogurt smoothie with alphonso mango', price: 129, isVeg: true, isAvailable: true, categoryId: '6', image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400' },
]

export default function MenuPage() {
  const router = useRouter()
  const tableId = useAppStore((state) => state.tableId)
  const cartCount = useAppStore((state) => state.getCartCount())
  const getCartTotal = useAppStore((state) => state.getCartTotal)
  
  const [categories, setCategories] = useState<Category[]>(demoCategories)
  const [items, setItems] = useState<MenuItem[]>(demoItems)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [showVegOnly, setShowVegOnly] = useState(false)

  useEffect(() => {
    // Redirect if no table selected
    if (!tableId) {
      router.push('/scan')
      return
    }

    // Fetch menu data
    fetchMenu()
  }, [tableId, router])

  const fetchMenu = async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/menu-items'),
      ])
      if (catRes.ok && itemRes.ok) {
        setCategories(await catRes.json())
        setItems(await itemRes.json())
      }
    } catch {
      // Use demo data
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory && item.categoryId !== selectedCategory) return false
      if (showVegOnly && !item.isVeg) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [items, selectedCategory, showVegOnly, searchQuery])

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      {/* Search Bar */}
      <div className="sticky top-16 z-20 glass border-b border-gray-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <AnimatePresence>
            {showSearch ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex-1"
              >
                <Input
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="w-5 h-5" />}
                  autoFocus
                />
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl flex-1 text-left text-gray-400 hover:bg-gray-50"
              >
                <Search className="w-5 h-5" />
                <span>Search menu...</span>
              </motion.button>
            )}
          </AnimatePresence>

          {showSearch && (
            <button
              onClick={() => {
                setShowSearch(false)
                setSearchQuery('')
              }}
              className="p-3 hover:bg-gray-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setShowVegOnly(!showVegOnly)}
            className={`p-3 rounded-xl transition-colors ${
              showVegOnly ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'
            }`}
          >
            <div className="badge-veg" style={{ transform: 'scale(1.2)' }} />
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Menu Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-32">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No items found</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory(null)
                setShowVegOnly(false)
              }}
              className="mt-4 text-[var(--primary)] font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MenuCard item={item} onSelect={setSelectedItem} />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-gray-100"
        >
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => router.push('/cart')}
              className="w-full gradient-primary text-white rounded-2xl py-4 px-6 flex items-center justify-between font-semibold shadow-lg hover:opacity-90 transition-opacity"
            >
              <span>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
              <span>View Cart · ₹{getCartTotal().toFixed(0)}</span>
            </button>
          </div>
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

