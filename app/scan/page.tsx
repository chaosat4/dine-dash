'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { QrCode, ChevronDown, ArrowRight } from 'lucide-react'
import { QRScanner } from '@/components/scanner/QRScanner'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/components/ui/Toaster'

function ScanContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showScanner, setShowScanner] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [tables, setTables] = useState<{ id: string; number: number }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { setTable } = useAppStore()
  const { addToast } = useToast()

  useEffect(() => {
    // Check for table param from QR redirect
    const tableParam = searchParams.get('table')
    if (tableParam) {
      handleTableSelect(tableParam)
    }

    // Fetch available tables
    fetchTables()
  }, [searchParams])

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables')
      if (res.ok) {
        const data = await res.json()
        setTables(data)
      }
    } catch {
      // Use demo tables if API fails
      setTables([
        { id: '1', number: 1 },
        { id: '2', number: 2 },
        { id: '3', number: 3 },
        { id: '4', number: 4 },
        { id: '5', number: 5 },
      ])
    }
  }

  const handleQRScan = (data: string) => {
    try {
      // Parse QR data - expecting format: tableId or URL with table param
      const url = new URL(data)
      const tableId = url.searchParams.get('table') || data
      handleTableSelect(tableId)
    } catch {
      // If not a URL, treat as table ID directly
      handleTableSelect(data)
    }
  }

  const handleTableSelect = async (tableId: string) => {
    setIsLoading(true)
    try {
      // Validate table
      const res = await fetch(`/api/tables/${tableId}`)
      if (res.ok) {
        const table = await res.json()
        setTable(table.id, table.number)
        addToast({ title: `Welcome to Table ${table.number}!`, type: 'success' })
        router.push('/menu')
      } else {
        addToast({ title: 'Invalid table', description: 'Please try again', type: 'error' })
      }
    } catch {
      // Demo mode - just use the ID
      const tableNum = parseInt(tableId) || 1
      setTable(tableId, tableNum)
      addToast({ title: `Welcome to Table ${tableNum}!`, type: 'success' })
      router.push('/menu')
    } finally {
      setIsLoading(false)
    }
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div className="min-h-screen gradient-hero">
      <div className="max-w-lg mx-auto px-4 py-8 md:py-16">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1
            className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-2"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Welcome!
          </h1>
          <p className="text-gray-600">
            {isMobile
              ? 'Scan the QR code on your table to start ordering'
              : 'Enter your table number to begin'}
          </p>
        </motion.div>

        {/* QR Scanner (Mobile) */}
        {isMobile && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            {showScanner ? (
              <QRScanner
                onScan={handleQRScan}
                onError={(error) => addToast({ title: 'Scanner Error', description: error, type: 'error' })}
              />
            ) : (
              <button
                onClick={() => setShowScanner(true)}
                className="w-full aspect-square max-w-sm mx-auto rounded-3xl bg-white shadow-lg flex flex-col items-center justify-center gap-4 hover:shadow-xl transition-shadow"
              >
                <div className="w-20 h-20 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-[var(--primary)]" />
                </div>
                <span className="font-medium text-[var(--text)]">Tap to Scan QR Code</span>
              </button>
            )}
          </motion.div>
        )}

        {/* Desktop QR Instructions */}
        {!isMobile && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-lg mb-8 text-center"
          >
            <div className="w-24 h-24 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-12 h-12 text-[var(--primary)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-2">
              Scan QR Code with Your Phone
            </h2>
            <p className="text-gray-500">
              Use your phone camera to scan the QR code on your table, or select your table below
            </p>
          </motion.div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Manual Table Selection */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="font-semibold text-[var(--text)] mb-4">Select Your Table</h3>
          
          <div className="relative mb-4">
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
            >
              <option value="">Choose table number...</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  Table {table.number}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          <Button
            onClick={() => selectedTable && handleTableSelect(selectedTable)}
            disabled={!selectedTable || isLoading}
            loading={isLoading}
            fullWidth
            size="lg"
          >
            Continue to Menu
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen gradient-hero flex items-center justify-center">Loading...</div>}>
      <ScanContent />
    </Suspense>
  )
}

