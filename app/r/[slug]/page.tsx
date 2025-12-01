'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { UtensilsCrossed } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { Restaurant } from '@/types'

export default function RestaurantSplashPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const tableId = searchParams.get('table')
  
  const setRestaurant = useAppStore((s) => s.setRestaurant)
  const [restaurant, setRestaurantData] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await fetch(`/api/restaurants/${slug}`)
        if (res.ok) {
          const data = await res.json()
          setRestaurantData(data)
          setRestaurant(data)
        }
      } catch (error) {
        console.error('Error fetching restaurant:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRestaurant()
  }, [slug, setRestaurant])

  useEffect(() => {
    if (!isLoading && restaurant) {
      const timer = setTimeout(() => {
        if (tableId) {
          router.push(`/r/${slug}/menu?table=${tableId}`)
        } else {
          router.push(`/r/${slug}/scan`)
        }
      }, 2500)

      return () => clearTimeout(timer)
    }
  }, [isLoading, restaurant, router, slug, tableId])

  const brandSettings = restaurant?.brandSettings

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{
        background: brandSettings
          ? `linear-gradient(135deg, ${brandSettings.backgroundColor} 0%, ${brandSettings.primaryColor}10 50%, ${brandSettings.accentColor}20 100%)`
          : 'linear-gradient(135deg, #fdf8f5 0%, #fee2e2 50%, #fef3c7 100%)',
      }}
    >
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
          className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl mb-8"
          style={{
            background: brandSettings
              ? `linear-gradient(135deg, ${brandSettings.primaryColor} 0%, ${brandSettings.secondaryColor} 100%)`
              : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          }}
        >
          {brandSettings?.logoUrl ? (
            <img
              src={brandSettings.logoUrl}
              alt={restaurant?.name}
              className="w-20 h-20 object-contain"
            />
          ) : (
            <UtensilsCrossed className="w-14 h-14 text-white" />
          )}
        </motion.div>

        {/* Restaurant Name */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold mb-3 text-center"
          style={{ 
            fontFamily: 'var(--font-playfair)',
            color: brandSettings?.textColor || 'var(--text)',
          }}
        >
          {restaurant?.name || 'Loading...'}
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-lg text-gray-600 mb-12 text-center"
        >
          {brandSettings?.tagline || 'Scan, Order, Enjoy'}
        </motion.p>

        {/* Loading dots */}
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
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: brandSettings?.primaryColor || 'var(--primary)' }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-32 -right-32 w-64 h-64 rounded-full border"
          style={{ borderColor: `${brandSettings?.primaryColor || 'var(--primary)'}15` }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full border"
          style={{ borderColor: `${brandSettings?.accentColor || 'var(--accent)'}15` }}
        />
      </div>
    </div>
  )
}

