'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  UtensilsCrossed, 
  ArrowRight, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  User,
  Lock,
  Eye,
  EyeOff,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toaster'

interface FormData {
  restaurantName: string
  ownerName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  address: string
  city: string
  state: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      addToast({ title: 'Passwords do not match', type: 'error' })
      return
    }

    if (formData.password.length < 8) {
      addToast({ title: 'Password must be at least 8 characters', type: 'error' })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/onboarding/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        addToast({ title: 'Registration successful!', type: 'success' })
        router.push(`/onboarding/verify?email=${encodeURIComponent(formData.email)}`)
      } else {
        addToast({ title: data.error || 'Registration failed', type: 'error' })
      }
    } catch (error) {
      addToast({ title: 'Something went wrong', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    'Multi-table QR ordering',
    'Real-time kitchen display',
    'Custom branding & colors',
    'Analytics dashboard',
    'Staff management',
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-white/30" />
          <div className="absolute bottom-32 right-20 w-48 h-48 rounded-full border border-white/20" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white/5" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
              Dine & Dash
            </span>
          </div>
          <p className="text-white/70 text-lg">Restaurant Platform</p>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
            Transform Your Restaurant Experience
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Join thousands of restaurants offering seamless digital ordering to their customers.
          </p>
          
          <div className="space-y-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-white/90">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-white/50 text-sm relative z-10">
          © 2024 Dine & Dash. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#fdf8f5]">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--text)]">Dine & Dash</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
              Register Your Restaurant
            </h2>
            <p className="text-gray-500 mb-8">
              Start your journey to digital ordering
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Restaurant Name"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  placeholder="The Golden Fork"
                  icon={<Building2 className="w-5 h-5" />}
                  required
                />
                <Input
                  label="Owner Name"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  icon={<User className="w-5 h-5" />}
                  required
                />
              </div>

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="hello@restaurant.com"
                icon={<Mail className="w-5 h-5" />}
                required
              />

              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                icon={<Phone className="w-5 h-5" />}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    icon={<Lock className="w-5 h-5" />}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={<Lock className="w-5 h-5" />}
                  required
                />
              </div>

              <div className="pt-2">
                <Input
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                  icon={<MapPin className="w-5 h-5" />}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                />
                <Input
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <a href="/dashboard/login" className="text-[var(--primary)] font-medium hover:underline">
                  Sign in
                </a>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

