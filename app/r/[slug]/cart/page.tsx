'use client'

import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const { restaurant, cart, updateQuantity, removeFromCart, getCartTotal, tableNumber } = useAppStore()
  const brandSettings = restaurant?.brandSettings

  const subtotal = getCartTotal()
  const tax = subtotal * 0.05 // 5% tax
  const total = subtotal + tax

  if (cart.length === 0) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: brandSettings?.backgroundColor || 'var(--background)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div 
            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: `${brandSettings?.primaryColor || 'var(--primary)'}15` }}
          >
            <ShoppingBag 
              className="w-12 h-12" 
              style={{ color: brandSettings?.primaryColor || 'var(--primary)' }}
            />
          </div>
          <h2 
            className="text-2xl font-bold mb-2"
            style={{ color: brandSettings?.textColor || 'var(--text)', fontFamily: 'var(--font-playfair)' }}
          >
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8">Add some delicious items from our menu</p>
          <Button 
            onClick={() => router.push(`/r/${slug}/menu`)}
            style={{ backgroundColor: brandSettings?.primaryColor }}
          >
            Browse Menu
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen pb-32"
      style={{ backgroundColor: brandSettings?.backgroundColor || 'var(--background)' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 
              className="text-xl font-bold"
              style={{ color: brandSettings?.textColor || 'var(--text)' }}
            >
              Your Cart
            </h1>
            {tableNumber && (
              <p className="text-sm text-gray-500">Table {tableNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="p-4 space-y-4">
        {cart.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="flex gap-4">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={item.isVeg ? 'badge-veg' : 'badge-non-veg'} />
                      <h3 className="font-semibold" style={{ color: brandSettings?.textColor || 'var(--text)' }}>
                        {item.name}
                      </h3>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <p 
                    className="font-bold"
                    style={{ color: brandSettings?.primaryColor || 'var(--primary)' }}
                  >
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bill Summary - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tax (5%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span style={{ color: brandSettings?.primaryColor || 'var(--primary)' }}>
              {formatPrice(total)}
            </span>
          </div>
          <Button
            onClick={() => router.push(`/r/${slug}/checkout`)}
            className="w-full"
            style={{ backgroundColor: brandSettings?.primaryColor }}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  )
}

