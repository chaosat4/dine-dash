'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  UtensilsCrossed,
  QrCode,
  ChefHat,
  BarChart3,
  Smartphone,
  Zap,
  Shield,
  ArrowRight,
  Check,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

const features = [
  {
    icon: QrCode,
    title: 'QR Code Ordering',
    description: 'Customers scan, browse menu, and order directly from their table',
  },
  {
    icon: ChefHat,
    title: 'Kitchen Display',
    description: 'Real-time order queue with status management for kitchen staff',
  },
  {
    icon: Smartphone,
    title: 'Waiter Dashboard',
    description: 'Table-wise order tracking and service management',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Detailed insights on sales, popular items, and customer behavior',
  },
  {
    icon: Zap,
    title: 'Fast Setup',
    description: 'Get your restaurant online in minutes with our easy setup wizard',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with 99.9% uptime guarantee',
  },
]

const benefits = [
  'Reduce wait times by 50%',
  'Increase order accuracy',
  'Boost table turnover',
  'Custom branding',
  'Real-time analytics',
  'Multi-staff support',
]

const testimonials = [
  {
    name: 'Rajesh Kumar',
    restaurant: 'Spice Garden',
    text: 'Dine & Dash transformed how we serve customers. Orders are faster and more accurate.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    restaurant: 'The Urban Cafe',
    text: 'The kitchen display alone saved us hours of confusion. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Amit Patel',
    restaurant: 'Royal Biryani House',
    text: 'Setup was incredibly easy. We were live within an hour.',
    rating: 5,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fdf8f5]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
                Dine & Dash
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/login" className="text-gray-600 hover:text-[var(--primary)] font-medium">
                Login
              </Link>
              <Link href="/onboarding">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-[var(--primary)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-sm font-medium mb-6">
                🚀 Transform Your Restaurant Today
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-[var(--text)] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
                Digital Ordering for
                <span className="text-[var(--primary)]"> Modern Restaurants</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Empower your restaurant with QR code ordering, real-time kitchen management, 
                and powerful analytics. Join 500+ restaurants already using Dine & Dash.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/onboarding">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    See How It Works
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Hero Image/Demo */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-16 relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 aspect-video flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="flex justify-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                        <QrCode className="w-8 h-8" />
                      </div>
                      <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                        <ChefHat className="w-8 h-8" />
                      </div>
                      <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                        <BarChart3 className="w-8 h-8" />
                      </div>
                    </div>
                    <p className="text-lg font-medium">Complete Restaurant Management Platform</p>
                    <p className="text-sm text-white/60">Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
              Everything You Need to Run Your Restaurant
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From QR code ordering to kitchen management, we've got you covered with powerful tools 
              designed specifically for modern restaurants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text)] mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
                Why Restaurants Love Dine & Dash
              </h2>
              <p className="text-white/80 text-lg mb-8">
                Join hundreds of restaurants that have transformed their operations 
                and boosted their revenue with our platform.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-[var(--text)] mb-6">Start Your Free Trial</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Full feature access</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
              <Link href="/onboarding" className="block mt-6">
                <Button className="w-full" size="lg">
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
              Trusted by Restaurant Owners
            </h2>
            <p className="text-gray-600">See what our customers have to say</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold text-[var(--text)]">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.restaurant}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join 500+ restaurants already using Dine & Dash to serve customers better.
          </p>
          <Link href="/onboarding">
            <Button size="lg">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
                Dine & Dash
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 Dine & Dash. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
