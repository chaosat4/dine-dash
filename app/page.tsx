'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { UtensilsCrossed } from 'lucide-react'

export default function SplashPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if coming from QR scan (URL params)
    const params = new URLSearchParams(window.location.search)
    const tableId = params.get('table')

    const timer = setTimeout(() => {
      setIsLoading(false)
      if (tableId) {
        router.push(`/scan?table=${tableId}`)
      } else {
        router.push('/scan')
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="flex flex-col items-center"
      >
        {/* Logo */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          className="w-28 h-28 rounded-3xl gradient-primary flex items-center justify-center shadow-2xl mb-8"
        >
          <UtensilsCrossed className="w-14 h-14 text-white" />
        </motion.div>

        {/* Restaurant Name */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-3"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Dine & Dash
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-lg text-gray-600 mb-12"
            >
          Scan, Order, Enjoy
        </motion.p>

        {/* Loading dots */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex gap-2"
            >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
                className="w-3 h-3 rounded-full bg-[var(--primary)]"
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-32 -right-32 w-64 h-64 rounded-full border border-[var(--primary)]/10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full border border-[var(--accent)]/10"
        />
        </div>
    </div>
  )
}
