'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, ChevronDown, ChevronUp, Image as ImageIcon, X, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toaster'
import { formatPrice } from '@/lib/utils'
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
  { id: '1', name: 'Paneer Tikka', description: 'Marinated cottage cheese grilled to perfection', price: 299, isVeg: true, isAvailable: true, categoryId: '1' },
  { id: '2', name: 'Chicken 65', description: 'Spicy deep-fried chicken', price: 349, isVeg: false, isAvailable: true, categoryId: '1' },
  { id: '3', name: 'Butter Chicken', description: 'Tender chicken in rich tomato gravy', price: 399, isVeg: false, isAvailable: true, categoryId: '2' },
  { id: '4', name: 'Palak Paneer', description: 'Cottage cheese in spinach gravy', price: 329, isVeg: true, isAvailable: true, categoryId: '2' },
  { id: '5', name: 'Chicken Biryani', description: 'Aromatic rice with spiced chicken', price: 399, isVeg: false, isAvailable: true, categoryId: '3' },
  { id: '6', name: 'Butter Naan', description: 'Soft leavened bread', price: 69, isVeg: true, isAvailable: true, categoryId: '4' },
  { id: '7', name: 'Gulab Jamun', description: 'Sweet milk dumplings', price: 149, isVeg: true, isAvailable: true, categoryId: '5' },
  { id: '8', name: 'Masala Chai', description: 'Indian spiced tea', price: 49, isVeg: true, isAvailable: true, categoryId: '6' },
]

interface ItemFormData {
  name: string
  description: string
  price: string
  categoryId: string
  isVeg: boolean
  isAvailable: boolean
  image: string
}

const defaultFormData: ItemFormData = {
  name: '',
  description: '',
  price: '',
  categoryId: '',
  isVeg: true,
  isAvailable: true,
  image: '',
}

export default function MenuManagement() {
  const router = useRouter()
  const { addToast } = useToast()
  const [categories, setCategories] = useState<Category[]>(demoCategories)
  const [items, setItems] = useState<MenuItem[]>(demoItems)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(demoCategories.map((c) => c.id)))
  
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState<ItemFormData>(defaultFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/admin/verify')
      if (res.ok) {
        setIsAuthenticated(true)
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/admin/login')
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const fetchData = async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/menu-items'),
      ])
      if (catRes.ok) setCategories(await catRes.json())
      if (itemRes.ok) setItems(await itemRes.json())
    } catch {
      // Use demo data
    }
  }

  const filteredItems = items.filter((item) => {
    if (selectedCategory && item.categoryId !== selectedCategory) return false
    if (searchQuery) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const openAddModal = () => {
    setEditingItem(null)
    setFormData(defaultFormData)
    setShowItemModal(true)
  }

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      categoryId: item.categoryId,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      image: item.image || '',
    })
    setShowItemModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      addToast({ title: 'Please fill all required fields', type: 'error' })
      return
    }

    setIsLoading(true)
    try {
      const itemData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        isVeg: formData.isVeg,
        isAvailable: formData.isAvailable,
        image: formData.image || undefined,
      }

      if (editingItem) {
        // Update existing item
        try {
          await fetch(`/api/menu-items/${editingItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData),
          })
        } catch {
          // Demo mode
        }
        setItems((prev) =>
          prev.map((item) =>
            item.id === editingItem.id ? { ...item, ...itemData } : item
          )
        )
        addToast({ title: 'Item updated successfully', type: 'success' })
      } else {
        // Create new item
        const newItem: MenuItem = {
          id: crypto.randomUUID(),
          ...itemData,
        }
        try {
          const res = await fetch('/api/menu-items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData),
          })
          if (res.ok) {
            const created = await res.json()
            newItem.id = created.id
          }
        } catch {
          // Demo mode
        }
        setItems((prev) => [...prev, newItem])
        addToast({ title: 'Item added successfully', type: 'success' })
      }

      setShowItemModal(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      await fetch(`/api/menu-items/${itemId}`, { method: 'DELETE' })
    } catch {
      // Demo mode
    }
    setItems((prev) => prev.filter((item) => item.id !== itemId))
    addToast({ title: 'Item deleted', type: 'success' })
  }

  const toggleAvailability = async (item: MenuItem) => {
    const newAvailability = !item.isAvailable
    try {
      await fetch(`/api/menu-items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newAvailability }),
      })
    } catch {
      // Demo mode
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, isAvailable: newAvailability } : i
      )
    )
    addToast({
      title: newAvailability ? 'Item marked available' : 'Item marked unavailable',
      type: 'success',
    })
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Menu Management</h1>
          <p className="text-gray-500">Add, edit, and manage your menu items</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Items by Category (Desktop: Table, Mobile: List) */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryItems = filteredItems.filter((item) => item.categoryId === category.id)
          if (categoryItems.length === 0 && searchQuery) return null

          return (
            <div key={category.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[var(--text)]">{category.name}</span>
                  <span className="text-sm text-gray-400">({categoryItems.length} items)</span>
                </div>
                {expandedCategories.has(category.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              <AnimatePresence>
                {expandedCategories.has(category.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t"
                  >
                    {categoryItems.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">
                        No items in this category
                      </div>
                    ) : (
                      <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Item
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Availability
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {categoryItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {item.image ? (
                                          <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <ImageIcon className="w-5 h-5 text-gray-400" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-medium text-[var(--text)]">{item.name}</p>
                                        {item.description && (
                                          <p className="text-sm text-gray-500 truncate max-w-xs">
                                            {item.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 font-medium">
                                    {formatPrice(item.price)}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div
                                      className={item.isVeg ? 'badge-veg' : 'badge-non-veg'}
                                    />
                                  </td>
                                  <td className="px-6 py-4">
                                    <button
                                      onClick={() => toggleAvailability(item)}
                                      className={`relative w-12 h-6 rounded-full transition-colors ${
                                        item.isAvailable ? 'bg-green-500' : 'bg-gray-300'
                                      }`}
                                    >
                                      <span
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                          item.isAvailable ? 'left-7' : 'left-1'
                                        }`}
                                      />
                                    </button>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => openEditModal(item)}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile List */}
                        <div className="lg:hidden divide-y">
                          {categoryItems.map((item) => (
                            <div key={item.id} className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={item.isVeg ? 'badge-veg' : 'badge-non-veg'}
                                          style={{ transform: 'scale(0.8)' }}
                                        />
                                        <p className="font-medium text-[var(--text)]">{item.name}</p>
                                      </div>
                                      <p className="font-semibold text-[var(--primary)] mt-1">
                                        {formatPrice(item.price)}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => toggleAvailability(item)}
                                      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                                        item.isAvailable ? 'bg-green-500' : 'bg-gray-300'
                                      }`}
                                    >
                                      <span
                                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                                          item.isAvailable ? 'left-5' : 'left-0.5'
                                        }`}
                                      />
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2 mt-3">
                                    <button
                                      onClick={() => openEditModal(item)}
                                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(item.id)}
                                      className="px-3 py-1.5 text-sm text-red-500 bg-red-50 hover:bg-red-100 rounded-lg"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Add/Edit Item Modal */}
      <Modal
        open={showItemModal}
        onClose={() => setShowItemModal(false)}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
      >
        <div className="p-6 space-y-4">
          <Input
            label="Item Name *"
            placeholder="Enter item name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
              Description
            </label>
            <textarea
              placeholder="Enter item description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (₹) *"
              placeholder="0.00"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Image URL"
            placeholder="https://..."
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          />

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isVeg}
                onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
              />
              <span className="text-sm font-medium">Vegetarian</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <span className="text-sm font-medium">Available</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              loading={isLoading}
              className="flex-1"
            >
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
            <Button
              onClick={() => setShowItemModal(false)}
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

