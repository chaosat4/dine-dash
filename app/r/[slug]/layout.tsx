import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BrandProvider } from '@/components/BrandProvider'
import type { Metadata } from 'next'
import type { BrandSettings } from '@/types'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: { brandSettings: true },
  })

  if (!restaurant) {
    return { title: 'Restaurant Not Found' }
  }

  return {
    title: `${restaurant.name} - Order Online`,
    description: restaurant.brandSettings?.tagline || `Order from ${restaurant.name}`,
  }
}

export default async function RestaurantLayout({ children, params }: LayoutProps) {
  const { slug } = await params

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: { brandSettings: true },
  })

  if (!restaurant || !restaurant.isActive) {
    notFound()
  }

  return (
    <BrandProvider brandSettings={restaurant.brandSettings as BrandSettings | null}>
      {children}
    </BrandProvider>
  )
}

