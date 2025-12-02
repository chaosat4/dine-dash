'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function QRCodeRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/dashboard/tables')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Redirecting to Tables...</p>
      </div>
    </div>
  )
}
