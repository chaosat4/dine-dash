'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Camera, QrCode, ArrowRight, AlertCircle, ChevronDown } from 'lucide-react'
import jsQR from 'jsqr'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/components/ui/Toaster'

interface Table {
  id: string
  number: number
  status: string
}

export default function ScanPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { addToast } = useToast()
  const { restaurant, setRestaurant, setTable } = useAppStore()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTableId, setSelectedTableId] = useState<string>('')

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Fetch restaurant if not in store
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (restaurant && restaurant.slug === slug) return
      try {
        const res = await fetch(`/api/restaurants/${slug}`)
        if (res.ok) {
          const data = await res.json()
          setRestaurant(data)
        }
      } catch (err) {
        console.error('Error fetching restaurant:', err)
      }
    }
    fetchRestaurant()
  }, [slug, restaurant, setRestaurant])

  // Fetch tables once restaurant is loaded
  useEffect(() => {
    const fetchTables = async () => {
      if (!restaurant?.id) return
      try {
        const res = await fetch(`/api/tables?restaurantId=${restaurant.id}`)
        if (res.ok) {
          const data = await res.json()
          setTables(data)
        }
      } catch (err) {
        console.error('Error fetching tables:', err)
      }
    }
    fetchTables()
  }, [restaurant?.id])

  const handleTableSelect = (tableId: string) => {
    setSelectedTableId(tableId)
    const table = tables.find(t => t.id === tableId)
    if (table) {
      setTable(table.id, table.number)
      addToast({ title: `Table ${table.number} selected`, type: 'success' })
      router.push(`/r/${slug}/menu`)
    }
  }

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setHasPermission(true)
        setIsScanning(true)
        scanQRCode()
      }
    } catch (err) {
      console.error('Camera error:', err)
      setHasPermission(false)
      setError('Could not access camera. Please grant permission.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    const scan = () => {
      if (!isScanning || video.readyState !== video.HAVE_ENOUGH_DATA) {
        if (isScanning) requestAnimationFrame(scan)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code) {
        handleQRCode(code.data)
        return
      }

      requestAnimationFrame(scan)
    }

    requestAnimationFrame(scan)
  }

  const handleQRCode = (data: string) => {
    stopCamera()

    try {
      const url = new URL(data)
      const tableId = url.searchParams.get('table')
      
      if (tableId) {
        // Fetch table details
        fetchTableAndRedirect(tableId)
      } else {
        addToast({ title: 'Invalid QR code', type: 'error' })
        setError('This QR code is not valid for this restaurant.')
      }
    } catch {
      addToast({ title: 'Invalid QR code', type: 'error' })
      setError('Could not read the QR code. Please try again.')
    }
  }

  const fetchTableAndRedirect = async (tableId: string) => {
    try {
      const res = await fetch(`/api/tables/${tableId}`)
      if (res.ok) {
        const table = await res.json()
        setTable(table.id, table.number)
        addToast({ title: `Table ${table.number} selected`, type: 'success' })
        router.push(`/r/${slug}/menu`)
      } else {
        setError('Table not found. Please scan a valid QR code.')
      }
    } catch {
      setError('Could not verify table. Please try again.')
    }
  }

  const brandSettings = restaurant?.brandSettings

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: brandSettings?.backgroundColor || 'var(--background)' }}
    >
      {/* Header */}
      <div className="p-4 text-center">
        <h1 
          className="text-2xl font-bold mb-2"
          style={{ color: brandSettings?.textColor || 'var(--text)', fontFamily: 'var(--font-playfair)' }}
        >
          Scan Table QR Code
        </h1>
        <p className="text-gray-500">Point your camera at the QR code on your table</p>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {!isScanning ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-lg p-8 text-center"
            >
              <div 
                className="w-24 h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: `${brandSettings?.primaryColor || 'var(--primary)'}15` }}
              >
                <QrCode 
                  className="w-12 h-12" 
                  style={{ color: brandSettings?.primaryColor || 'var(--primary)' }}
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-left">{error}</p>
                </div>
              )}

              <Button 
                onClick={startCamera} 
                className="w-full mb-4"
                style={{ backgroundColor: brandSettings?.primaryColor }}
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Scanning
              </Button>

              <div className="relative w-full mt-4">
                <p className="text-sm text-gray-500 mb-2">Or select your table:</p>
                <div className="relative">
                  <select
                    value={selectedTableId}
                    onChange={(e) => handleTableSelect(e.target.value)}
                    className="w-full appearance-none px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 pr-10"
                    style={{ borderColor: brandSettings?.primaryColor }}
                  >
                    <option value="">Choose a table...</option>
                    {tables.map((table) => (
                      <option key={table.id} value={table.id}>
                        Table {table.number}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={() => router.push(`/r/${slug}/menu`)}
                className="text-sm text-gray-500 hover:text-gray-700 mt-4"
              >
                Skip and browse menu
              </button>
            </motion.div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-2xl overflow-hidden"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-4 border-white/50 rounded-2xl relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
                  
                  {/* Scanning line animation */}
                  <motion.div
                    className="absolute left-2 right-2 h-0.5 bg-white"
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </div>

              <button
                onClick={stopCamera}
                className="mt-4 w-full py-3 bg-white/90 rounded-xl text-gray-700 font-medium"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Skip to Menu */}
      {!isScanning && (
        <div className="p-4">
          <button
            onClick={() => router.push(`/r/${slug}/menu`)}
            className="w-full py-4 bg-white rounded-2xl shadow-sm flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span>Continue without scanning</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}

