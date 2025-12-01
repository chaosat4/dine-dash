'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toaster'

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const { addToast } = useToast()
  
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const chars = value.slice(0, 6).split('')
      const newCode = [...code]
      chars.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char
        }
      })
      setCode(newCode)
      const nextIndex = Math.min(index + chars.length, 5)
      inputRefs.current[nextIndex]?.focus()
    } else {
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const verificationCode = code.join('')
    if (verificationCode.length !== 6) {
      addToast({ title: 'Please enter the complete code', type: 'error' })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/onboarding/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      })

      const data = await res.json()

      if (res.ok) {
        addToast({ title: 'Email verified successfully!', type: 'success' })
        router.push(`/onboarding/setup?restaurantId=${data.restaurantId}`)
      } else {
        addToast({ title: data.error || 'Invalid code', type: 'error' })
      }
    } catch (error) {
      addToast({ title: 'Verification failed', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return

    try {
      const res = await fetch('/api/onboarding/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        addToast({ title: 'Verification code resent!', type: 'success' })
        setResendTimer(60)
        setCode(['', '', '', '', '', ''])
      } else {
        addToast({ title: 'Failed to resend code', type: 'error' })
      }
    } catch (error) {
      addToast({ title: 'Failed to resend code', type: 'error' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>

          <h1 className="text-2xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
            Verify Your Email
          </h1>
          <p className="text-gray-500 mb-8">
            We've sent a 6-digit code to<br />
            <span className="font-medium text-[var(--text)]">{email}</span>
          </p>

          <div className="flex justify-center gap-2 mb-8">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
              />
            ))}
          </div>

          <Button
            onClick={handleVerify}
            className="w-full mb-4"
            disabled={isLoading || code.some(d => !d)}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Verify & Continue
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>

          <button
            onClick={handleResend}
            disabled={resendTimer > 0}
            className="flex items-center gap-2 mx-auto text-sm text-gray-500 hover:text-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Didn't receive the email? Check your spam folder
        </p>
      </motion.div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}

