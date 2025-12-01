'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, ChevronDown, ChevronUp, Image as ImageIcon, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toaster'
import { formatPrice } from '@/lib/utils'
import { useStaffStore } from '@/lib/store'
import type { MenuItem, Category } from '@/types'

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
  const { restaurantId } = useStaffStore()
  const { addToast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  
  const [showItemModal, setShowItemModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState<ItemFormData>(defaultFormData)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [restaurantId])

  const fetchData = async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/menu-items'),
      ])
      if (catRes.ok) {
        const cats = await catRes.json()
        setCategories(cats)
        setExpandedCategories(new Set(cats.map((c: Category) => c.id)))
      }
      if (itemRes.ok) setItems(await itemRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
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

    setIsSaving(true)
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
        const res = await fetch(`/api/menu-items/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        })
        if (res.ok) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === editingItem.id ? { ...item, ...itemData } : item
            )
          )
          addToast({ title: 'Item updated successfully', type: 'success' })
        }
      } else {
        const res = await fetch('/api/menu-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        })
        if (res.ok) {
          const newItem = await res.json()
          setItems((prev) => [...prev, newItem])
          addToast({ title: 'Item added successfully', type: 'success' })
        }
      }
      setShowItemModal(false)
    } catch (error) {
      addToast({ title: 'Operation failed', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      addToast({ title: 'Please enter a category name', type: 'error' })
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      })
      if (res.ok) {
        const newCat = await res.json()
        setCategories((prev) => [...prev, newCat])
        setExpandedCategories((prev) => new Set([...prev, newCat.id]))
        addToast({ title: 'Category added', type: 'success' })
        setShowCategoryModal(false)
        setNewCategoryName('')
      }
    } catch (error) {
      addToast({ title: 'Failed to add category', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      await fetch(`/api/menu-items/${itemId}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((item) => item.id !== itemId))
      addToast({ title: 'Item deleted', type: 'success' })
    } catch (error) {
      addToast({ title: 'Failed to delete item', type: 'error' })
    }
  }

  const toggleAvailability = async (item: MenuItem) => {
    const newAvailability = !item.isAvailable
    try {
      await fetch(`/api/menu-items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newAvailability }),
      })
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, isAvailable: newAvailability } : i
        )
      )
      addToast({
        title: newAvailability ? 'Item marked available' : 'Item marked unavailable',
        type: 'success',
      })
    } catch (error) {
      addToast({ title: 'Failed to update', type: 'error' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <Utensils className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
              Menu Management
            </h1>
            <p className="text-gray-500">Add, edit, and manage your menu items</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCategoryModal(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Category
          </Button>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
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

      {/* Items by Category */}
      <div className="space-y-4">
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
                      <div className="divide-y">
                        {categoryItems.map((item) => (
                          <div key={item.id} className="p-4 hover:bg-gray-50">
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-6 h-6 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <div className={item.isVeg ? 'badge-veg' : 'badge-non-veg'} />
                                      <span className="font-semibold text-[var(--text)]">{item.name}</span>
                                    </div>
                                    {item.description && (
                                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                                    )}
                                    <p className="font-bold text-[var(--primary)] mt-2">{formatPrice(item.price)}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
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
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        {categories.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text)] mb-2">No Categories Yet</h3>
            <p className="text-gray-500 mb-4">Start by adding a category for your menu items</p>
            <Button onClick={() => setShowCategoryModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
        )}
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
            <Button onClick={handleSubmit} loading={isSaving} className="flex-1">
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
            <Button onClick={() => setShowItemModal(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        open={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Add New Category"
      >
        <div className="p-6 space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g., Starters, Main Course, Desserts"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <div className="flex gap-3 pt-4">
            <Button onClick={handleAddCategory} loading={isSaving} className="flex-1">
              Add Category
            </Button>
            <Button onClick={() => setShowCategoryModal(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

