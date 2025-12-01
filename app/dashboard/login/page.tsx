'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { UtensilsCrossed, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toaster'
import { useStaffStore } from '@/lib/store'

export default function DashboardLoginPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const setStaff = useStaffStore((s) => s.setStaff)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setStaff({
          staffId: data.staffId,
          restaurantId: data.restaurantId,
          staffName: data.name,
          role: data.role,
        })
        addToast({ title: 'Login successful!', type: 'success' })
        
        // Redirect based on role
        switch (data.role) {
          case 'CHEF':
            router.push('/dashboard/kitchen')
            break
          case 'WAITER':
            router.push('/dashboard/orders')
            break
          default:
            router.push('/dashboard')
        }
      } else {
        addToast({ title: data.error || 'Login failed', type: 'error' })
      }
    } catch (error) {
      addToast({ title: 'Something went wrong', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
              Dine & Dash
            </span>
          </div>
          <p className="text-white/60">Staff Dashboard</p>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
            Manage Your Restaurant Efficiently
          </h1>
          <p className="text-white/70 text-lg">
            Access orders, kitchen queue, table management, and analytics all in one place.
          </p>
        </div>

        <div className="relative z-10 flex gap-8">
          <div>
            <p className="text-3xl font-bold text-white">500+</p>
            <p className="text-white/50 text-sm">Restaurants</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">1M+</p>
            <p className="text-white/50 text-sm">Orders Served</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">99.9%</p>
            <p className="text-white/50 text-sm">Uptime</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#fdf8f5]">
        <div className="w-full max-w-md">
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
              Staff Login
            </h2>
            <p className="text-gray-500 mb-8">
              Sign in to access your dashboard
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                icon={<Mail className="w-5 h-5" />}
                required
              />

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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-[var(--primary)] hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>

              <p className="text-center text-sm text-gray-500 mt-6">
                New restaurant?{' '}
                <a href="/onboarding" className="text-[var(--primary)] font-medium hover:underline">
                  Register here
                </a>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

