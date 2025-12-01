'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Plus, Download, Printer, Trash2, QrCode, Copy, ExternalLink, Check } from 'lucide-react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toaster'
import { useStaffStore } from '@/lib/store'
import type { Table, Restaurant } from '@/types'

export default function QRCodeManagement() {
  const { restaurantId } = useStaffStore()
  const { addToast } = useToast()
  const [tables, setTables] = useState<Table[]>([])
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [qrCodes, setQrCodes] = useState<Map<string, string>>(new Map())
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTableNumber, setNewTableNumber] = useState('')
  const [newTableName, setNewTableName] = useState('')
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    fetchData()
  }, [restaurantId])

  const fetchData = async () => {
    try {
      const [tablesRes, settingsRes] = await Promise.all([
        fetch('/api/tables'),
        fetch('/api/dashboard/settings'),
      ])
      if (tablesRes.ok) setTables(await tablesRes.json())
      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setRestaurant(data.restaurant)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!restaurant?.slug) return
    
    tables.forEach(async (table) => {
      const url = `${baseUrl}/r/${restaurant.slug}?table=${table.id}`
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1d3557',
          light: '#ffffff',
        },
      })
      setQrCodes((prev) => new Map(prev).set(table.id, qrDataUrl))
    })
  }, [tables, baseUrl, restaurant?.slug])

  const handleAddTable = async () => {
    const tableNum = parseInt(newTableNumber)
    if (!tableNum || tableNum < 1) {
      addToast({ title: 'Please enter a valid table number', type: 'error' })
      return
    }

    if (tables.some((t) => t.number === tableNum)) {
      addToast({ title: 'Table number already exists', type: 'error' })
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          number: tableNum,
          name: newTableName || `Table ${tableNum}`,
        }),
      })
      if (res.ok) {
        const newTable = await res.json()
        setTables((prev) => [...prev, newTable].sort((a, b) => a.number - b.number))
        addToast({ title: `Table ${tableNum} created`, type: 'success' })
        setShowAddModal(false)
        setNewTableNumber('')
        setNewTableName('')
      }
    } catch (error) {
      addToast({ title: 'Failed to create table', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return

    try {
      await fetch(`/api/tables/${tableId}`, { method: 'DELETE' })
      setTables((prev) => prev.filter((t) => t.id !== tableId))
      addToast({ title: 'Table deleted', type: 'success' })
    } catch (error) {
      addToast({ title: 'Failed to delete table', type: 'error' })
    }
  }

  const downloadQR = async (table: Table) => {
    const qrDataUrl = qrCodes.get(table.id)
    if (!qrDataUrl) return

    const link = document.createElement('a')
    link.download = `table-${table.number}-qr.png`
    link.href = qrDataUrl
    link.click()
    addToast({ title: 'QR code downloaded', type: 'success' })
  }

  const copyLink = (table: Table) => {
    if (!restaurant?.slug) return
    const url = `${baseUrl}/r/${restaurant.slug}?table=${table.id}`
    navigator.clipboard.writeText(url)
    setCopied(table.id)
    setTimeout(() => setCopied(null), 2000)
    addToast({ title: 'Link copied to clipboard', type: 'success' })
  }

  const printAllQRs = () => {
    setSelectedTable(null)
    setTimeout(() => window.print(), 100)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <QrCode className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
              QR Code Management
            </h1>
            <p className="text-gray-500">Create and manage table QR codes</p>
          </div>
        </div>
        <div className="flex gap-3 no-print">
          <Button onClick={printAllQRs} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print All
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </Button>
        </div>
      </div>

      {/* QR Code Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table, index) => (
          <motion.div
            key={table.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden print:shadow-none print:border"
          >
            <div className="p-6 text-center">
              <div className="inline-block p-4 bg-gray-50 rounded-xl mb-4">
                {qrCodes.get(table.id) ? (
                  <img
                    src={qrCodes.get(table.id)}
                    alt={`Table ${table.number} QR`}
                    className="w-48 h-48"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-gray-300 animate-pulse" />
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-[var(--text)] mb-1">
                Table {table.number}
              </h3>
              {table.name && table.name !== `Table ${table.number}` && (
                <p className="text-sm text-gray-500 mb-2">{table.name}</p>
              )}
              <p className="text-sm text-gray-400 mb-4">Scan to order</p>

              {/* Actions */}
              <div className="flex justify-center gap-2 no-print">
                <button
                  onClick={() => downloadQR(table)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => copyLink(table)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                  title="Copy Link"
                >
                  {copied === table.id ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                {restaurant?.slug && (
                  <a
                    href={`/r/${restaurant.slug}?table=${table.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                    title="Open Link"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
                <button
                  onClick={() => handleDeleteTable(table.id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Link Preview */}
            {restaurant?.slug && (
              <div className="px-6 pb-4 no-print">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Scan URL:</p>
                  <p className="text-xs text-gray-600 font-mono break-all">
                    /r/{restaurant.slug}?table={table.id}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text)] mb-2">No Tables Yet</h3>
          <p className="text-gray-500 mb-4">Add your first table to generate a QR code</p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </Button>
        </div>
      )}

      {/* Print Template (Hidden) */}
      <div className="hidden print:block">
        <style jsx>{`
          @media print {
            body { background: white !important; }
            .no-print { display: none !important; }
          }
        `}</style>
        <div className="grid grid-cols-2 gap-8 p-8">
          {tables.map((table) => (
            <div key={table.id} className="text-center border rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-2">{restaurant?.name || 'Restaurant'}</h2>
              <h3 className="text-xl font-bold mb-4">Table {table.number}</h3>
              {qrCodes.get(table.id) && (
                <img
                  src={qrCodes.get(table.id)}
                  alt={`Table ${table.number} QR`}
                  className="w-40 h-40 mx-auto mb-2"
                />
              )}
              <p className="text-sm text-gray-500">Scan to Order</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Table Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Table"
      >
        <div className="p-6 space-y-4">
          <Input
            label="Table Number *"
            type="number"
            placeholder="Enter table number"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            min={1}
          />

          <Input
            label="Table Name (Optional)"
            placeholder="e.g., Window Seat, Private Booth"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
          />

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">
              A unique QR code will be generated for this table. Customers can scan it to access the menu and place orders directly.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleAddTable} loading={isSaving} className="flex-1">
              Create Table
            </Button>
            <Button onClick={() => setShowAddModal(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

