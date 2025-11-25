'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { CartItem } from '@/components/cart/CartItem'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const router = useRouter()
  const { cart, clearCart, getCartTotal, tableNumber } = useAppStore()
  const [specialRequests, setSpecialRequests] = useState('')

  const subtotal = getCartTotal()
  const tax = subtotal * 0.05 // 5% GST
  const total = subtotal + tax

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header title="Cart" showBack showCart={false} />
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-6"
          >
            <ShoppingBag className="w-16 h-16 text-gray-300" />
          </motion.div>
          <h2 className="text-xl font-semibold text-[var(--text)] mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-6 text-center">
            Add some delicious items from our menu
          </p>
          <Button onClick={() => router.push('/menu')}>
            Browse Menu
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-48">
      <Header title="Your Cart" showBack showCart={false} />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Table Info */}
        {tableNumber && (
          <div className="bg-[var(--primary)]/10 rounded-xl p-4 mb-6 flex items-center justify-between">
            <span className="text-[var(--primary)] font-medium">
              Table {tableNumber}
            </span>
            <span className="text-sm text-gray-500">
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-3 mb-6">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                layout
              >
                <CartItem item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Special Requests */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-[var(--text)] mb-3">
            Special Requests
          </h3>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Any allergies or special instructions for the kitchen?"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            rows={3}
          />
        </div>

        {/* Clear Cart */}
        <button
          onClick={clearCart}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium mb-6"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cart
        </button>
      </main>

      {/* Fixed Bottom - Order Summary */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-gray-100">
        <div className="max-w-3xl mx-auto p-4">
          {/* Price Breakdown */}
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">GST (5%)</span>
              <span className="font-medium">{formatPrice(tax)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-bold text-lg text-[var(--primary)]">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <Button
            onClick={() => {
              // Store special requests and proceed to checkout
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('specialRequests', specialRequests)
              }
              router.push('/checkout')
            }}
            fullWidth
            size="lg"
          >
            Proceed to Checkout
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

