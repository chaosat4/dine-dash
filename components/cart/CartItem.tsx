'use client'

import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useAppStore, type CartItem as CartItemType } from '@/lib/store'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useAppStore()

  return (
    <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm">
      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
            <span className="text-2xl">🍽️</span>
          </div>
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
              <h3 className="font-semibold text-[var(--text)] truncate">
                {item.name}
              </h3>
            </div>
            {item.customizations && Object.keys(item.customizations).length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {Object.values(item.customizations).join(', ')}
              </p>
            )}
            {item.notes && (
              <p className="text-xs text-gray-400 mt-1 italic">
                &quot;{item.notes}&quot;
              </p>
            )}
          </div>
          <button
            onClick={() => removeFromCart(item.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8 rounded-md hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center font-medium text-sm">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 rounded-md hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <span className="font-bold text-[var(--text)]">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  )
}

