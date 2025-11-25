'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Minus, Plus, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/components/ui/Toaster'
import type { MenuItem } from '@/types'

interface ItemDetailModalProps {
  item: MenuItem | null
  open: boolean
  onClose: () => void
}

export function ItemDetailModal({ item, open, onClose }: ItemDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')
  const addToCart = useAppStore((state) => state.addToCart)
  const { addToast } = useToast()

  if (!item) return null

  const handleAddToCart = () => {
    addToCart({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      image: item.image,
      isVeg: item.isVeg,
      customizations: Object.keys(selectedCustomizations).length > 0 ? selectedCustomizations : undefined,
      notes: notes || undefined,
    })
    addToast({ title: `${item.name} added to cart`, type: 'success' })
    onClose()
    setQuantity(1)
    setSelectedCustomizations({})
    setNotes('')
  }

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      className="!inset-0 !w-full !h-full !max-w-none !max-h-none !translate-x-0 !translate-y-0 md:!inset-auto md:!top-1/2 md:!left-1/2 md:!-translate-x-1/2 md:!-translate-y-1/2 md:!w-[1100px] md:!h-[650px] !p-0 !rounded-none md:!rounded-2xl !overflow-hidden [&>div]:!overflow-hidden [&>div]:!max-h-none [&>div]:h-full"
    >
      <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">
        {/* Image Section - Left Half */}
        <div className="relative w-full md:w-[550px] h-[40vh] md:h-full shrink-0">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
              <span className="text-9xl">🍽️</span>
            </div>
          )}
        </div>

        {/* Details Section - Right Half */}
        <div className="flex-1 flex flex-col bg-white w-full md:w-[550px]">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 md:px-8 py-5 md:py-6">
            <div className="flex items-start gap-4 mb-5">
              <div
                className={item.isVeg ? 'badge-veg mt-1' : 'badge-non-veg mt-1'}
              />
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)] mb-2">{item.name}</h2>
                <p className="text-2xl font-semibold text-[var(--primary)]">
                  {formatPrice(item.price)}
                </p>
              </div>
            </div>

            {item.description && (
              <p className="text-gray-600 text-base leading-relaxed mb-6">{item.description}</p>
            )}

            {/* Customizations */}
            {item.customizations && item.customizations.length > 0 && (
              <div className="space-y-5 mb-6">
                <h3 className="text-lg font-bold text-[var(--text)]">Customize Your Order</h3>
                {item.customizations.map((customization) => (
                  <div key={customization.id} className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-semibold mb-3 text-base">
                      {customization.name}
                      {customization.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {customization.options.map((option) => (
                        <button
                          key={option}
                          onClick={() =>
                            setSelectedCustomizations((prev) => ({
                              ...prev,
                              [customization.name]: option,
                            }))
                          }
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            selectedCustomizations[customization.name] === option
                              ? 'bg-[var(--primary)] text-white shadow-md'
                              : 'bg-white hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Special Notes */}
            <div className="mb-4">
              <h4 className="font-semibold mb-3 text-base">Special Instructions</h4>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests? (e.g., less spicy, no onions)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-base"
                rows={3}
              />
            </div>
          </div>

          {/* Fixed Bottom Bar */}
          <div className="flex items-center gap-4 px-6 md:px-8 py-4 md:py-5 border-t bg-white shrink-0">
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1.5">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="w-10 text-center font-semibold text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <Button
              onClick={handleAddToCart}
              className="flex-1 text-base"
              size="lg"
              disabled={!item.isAvailable}
            >
              Add to Cart - {formatPrice(item.price * quantity)}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

