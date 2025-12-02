'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, User, ArrowLeft, UtensilsCrossed } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  showBack?: boolean
  showCart?: boolean
  showProfile?: boolean
  transparent?: boolean
}

export function Header({
  title,
  showBack = false,
  showCart = true,
  showProfile = true,
  transparent = false,
}: HeaderProps) {
  const pathname = usePathname()
  const cartCount = useAppStore((state) => state.getCartCount())
  const tableNumber = useAppStore((state) => state.tableNumber)
  const restaurant = useAppStore((state) => state.restaurant)
  const brandSettings = restaurant?.brandSettings
  
  // Extract slug from pathname (e.g., /r/my-restaurant/menu -> my-restaurant)
  const slugMatch = pathname.match(/^\/r\/([^/]+)/)
  const slug = slugMatch ? slugMatch[1] : null

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        transparent ? 'bg-transparent' : 'glass border-b border-gray-100'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <Link href={slug ? `/r/${slug}/menu` : '/menu'} className="flex items-center gap-2">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
                style={{
                  background: brandSettings?.logoUrl 
                    ? 'transparent' 
                    : brandSettings?.primaryColor 
                      ? `linear-gradient(135deg, ${brandSettings.primaryColor} 0%, ${brandSettings.secondaryColor || brandSettings.primaryColor} 100%)`
                      : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                }}
              >
                {brandSettings?.logoUrl ? (
                  <img 
                    src={brandSettings.logoUrl} 
                    alt={restaurant?.name || 'Logo'} 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <UtensilsCrossed className="w-5 h-5 text-white" />
                )}
              </div>
              <span className="font-bold text-lg text-[var(--text)] hidden sm:block">
                {restaurant?.name || 'Dine & Dash'}
              </span>
            </Link>
          )}
          {title && (
            <h1 className="font-semibold text-lg text-[var(--text)]">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {tableNumber && (
            <div className="px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-sm font-medium">
              Table {tableNumber}
            </div>
          )}

          {showCart && (
            <Link
              href={slug ? `/r/${slug}/cart` : '/cart'}
              className={cn(
                'relative p-2 rounded-full transition-colors',
                pathname.endsWith('/cart')
                  ? 'text-white'
                  : 'hover:bg-gray-100'
              )}
              style={{
                backgroundColor: pathname.endsWith('/cart') 
                  ? (brandSettings?.primaryColor || 'var(--primary)') 
                  : undefined
              }}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  style={{ backgroundColor: brandSettings?.primaryColor || 'var(--primary)' }}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}

          {showProfile && (
            <Link
              href={slug ? `/r/${slug}/profile` : '/profile'}
              className={cn(
                'p-2 rounded-full transition-colors',
                pathname.endsWith('/profile')
                  ? 'text-white'
                  : 'hover:bg-gray-100'
              )}
              style={{
                backgroundColor: pathname.endsWith('/profile') 
                  ? (brandSettings?.primaryColor || 'var(--primary)') 
                  : undefined
              }}
            >
              <User className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

