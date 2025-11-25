'use client'

import Image from 'next/image'
import { Plus } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { MenuItem } from '@/types'

interface MenuCardProps {
  item: MenuItem
  onSelect: (item: MenuItem) => void
}

export function MenuCard({ item, onSelect }: MenuCardProps) {
  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white px-4 py-2 rounded-full text-sm font-medium">
              Not Available
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start gap-2 mb-2">
          <div
            className={item.isVeg ? 'badge-veg' : 'badge-non-veg'}
            title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
          />
          <h3 className="font-semibold text-[var(--text)] flex-1 line-clamp-2">
            {item.name}
          </h3>
        </div>

        {item.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-[var(--text)]">
            {formatPrice(item.price)}
          </span>
          <button
            disabled={!item.isAvailable}
            className="w-9 h-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

