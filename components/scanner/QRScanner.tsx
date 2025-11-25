'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import jsQR from 'jsqr'
import { Camera, CameraOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface QRScannerProps {
  onScan: (data: string) => void
  onError?: (error: string) => void
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | undefined>(undefined)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setHasPermission(true)
        setIsScanning(true)
      }
    } catch (err) {
      setHasPermission(false)
      const message = err instanceof Error ? err.message : 'Camera access denied'
      setError(message)
      onError?.(message)
    }
  }, [onError])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setIsScanning(false)
  }, [])

  const scanQRCode = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !isScanning) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      })

      if (code) {
        stopCamera()
        onScan(code.data)
        return
      }
    }

    animationRef.current = requestAnimationFrame(scanQRCode)
  }, [isScanning, onScan, stopCamera])

  useEffect(() => {
    if (isScanning) {
      animationRef.current = requestAnimationFrame(scanQRCode)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isScanning, scanQRCode])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="aspect-square rounded-3xl overflow-hidden bg-black relative">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scanning overlay */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 relative">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-xl" />
              
              {/* Scanning line animation */}
              <div className="absolute left-4 right-4 h-0.5 bg-[var(--primary)] animate-bounce-slow" />
            </div>
          </div>
        )}

        {/* Permission denied / Error state */}
        {hasPermission === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
            <CameraOff className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Camera Access Required</p>
            <p className="text-sm text-gray-400 mb-4">
              {error || 'Please allow camera access to scan QR codes'}
            </p>
            <Button onClick={startCamera} variant="outline" className="border-white text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* Initial state */}
        {hasPermission === null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
            <Camera className="w-16 h-16 text-white opacity-50 mb-4" />
            <Button onClick={startCamera}>
              Start Scanning
            </Button>
          </div>
        )}
      </div>

      {isScanning && (
        <p className="text-center text-gray-500 mt-4 text-sm">
          Point your camera at the QR code on your table
        </p>
      )}
    </div>
  )
}

