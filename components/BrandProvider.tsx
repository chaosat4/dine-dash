'use client'

import { useEffect } from 'react'
import type { BrandSettings } from '@/types'

interface BrandProviderProps {
  brandSettings?: BrandSettings | null
  children: React.ReactNode
}

export function BrandProvider({ brandSettings, children }: BrandProviderProps) {
  useEffect(() => {
    if (!brandSettings) return

    const root = document.documentElement

    // Apply color scheme
    root.style.setProperty('--primary', brandSettings.primaryColor)
    root.style.setProperty('--primary-dark', adjustColor(brandSettings.primaryColor, -20))
    root.style.setProperty('--secondary', brandSettings.secondaryColor)
    root.style.setProperty('--accent', brandSettings.accentColor)
    root.style.setProperty('--background', brandSettings.backgroundColor)
    root.style.setProperty('--text', brandSettings.textColor)

    // Apply fonts
    if (brandSettings.headingFont) {
      root.style.setProperty('--font-playfair', `"${brandSettings.headingFont}", serif`)
    }
    if (brandSettings.bodyFont) {
      root.style.setProperty('--font-outfit', `"${brandSettings.bodyFont}", sans-serif`)
    }

    // Update theme color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]')
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', brandSettings.primaryColor)
    }

    return () => {
      // Reset to defaults on unmount
      root.style.removeProperty('--primary')
      root.style.removeProperty('--primary-dark')
      root.style.removeProperty('--secondary')
      root.style.removeProperty('--accent')
      root.style.removeProperty('--background')
      root.style.removeProperty('--text')
    }
  }, [brandSettings])

  return <>{children}</>
}

// Helper function to lighten/darken a hex color
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, Math.max(0, (num >> 16) + amt))
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt))
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt))
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`
}

