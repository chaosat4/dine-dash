'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Receipt,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  X,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toaster'
import { useStaffStore } from '@/lib/store'
import type { Invoice, PaymentStatus, TaxBreakdownItem } from '@/types'

interface InvoiceWithOrder extends Omit<Invoice, 'order'> {
  order?: {
    orderNumber: string
    table?: { number: number }
    items: { menuItem?: { name: string }; quantity: number; price: number }[]
  }
}

interface RestaurantSettings {
  name: string
  address?: string
  phone: string
  email: string
  currency: string
  currencySymbol: string
  taxSettings: { name: string; rate: number; isActive: boolean }[]
}

export default function InvoicesPage() {
  const { restaurantId } = useStaffStore()
  const { addToast } = useToast()
  const [invoices, setInvoices] = useState<InvoiceWithOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithOrder | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL')
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('month')
  const [restaurant, setRestaurant] = useState<RestaurantSettings | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchInvoices = useCallback(async () => {
    try {
      const [invoicesRes, settingsRes] = await Promise.all([
        fetch(`/api/dashboard/invoices?range=${dateRange}`),
        fetch('/api/dashboard/settings'),
      ])

      if (invoicesRes.ok) {
        const data = await invoicesRes.json()
        setInvoices(data.invoices || [])
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setRestaurant({
          name: data.restaurant?.name || 'Restaurant',
          address: data.restaurant?.address,
          phone: data.restaurant?.phone || '',
          email: data.restaurant?.email || '',
          currency: data.restaurant?.currency || 'INR',
          currencySymbol: data.restaurant?.currencySymbol || '₹',
          taxSettings: data.taxSettings || [],
        })
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchInvoices()
  }

  const formatCurrency = (amount: number) => {
    const symbol = restaurant?.currencySymbol || '₹'
    return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Paid' }
      case 'PENDING':
        return { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending' }
      case 'FAILED':
        return { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Failed' }
      case 'REFUNDED':
        return { color: 'bg-gray-100 text-gray-700', icon: Receipt, label: 'Refunded' }
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: FileText, label: status }
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    if (statusFilter !== 'ALL' && invoice.paymentStatus !== statusFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.customerName?.toLowerCase().includes(query) ||
        invoice.customerPhone?.includes(query) ||
        invoice.order?.orderNumber.toLowerCase().includes(query)
      )
    }
    return true
  })

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePrint = (invoice: InvoiceWithOrder) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const taxBreakdown = invoice.taxBreakdown as TaxBreakdownItem[] || []

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 15px; margin-bottom: 15px; }
            .header h1 { font-size: 20px; margin-bottom: 5px; }
            .header p { font-size: 12px; color: #666; }
            .invoice-info { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 15px; }
            .items { border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 10px 0; margin-bottom: 10px; }
            .item { display: flex; justify-content: space-between; font-size: 13px; padding: 5px 0; }
            .item-name { flex: 1; }
            .item-qty { width: 40px; text-align: center; }
            .item-price { width: 80px; text-align: right; }
            .totals { font-size: 13px; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .total-row.grand { font-weight: bold; font-size: 16px; border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${restaurant?.name || 'Restaurant'}</h1>
            ${restaurant?.address ? `<p>${restaurant.address}</p>` : ''}
            <p>${restaurant?.phone || ''} | ${restaurant?.email || ''}</p>
          </div>
          
          <div class="invoice-info">
            <div>
              <strong>Invoice:</strong> ${invoice.invoiceNumber}<br>
              <strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}<br>
              <strong>Time:</strong> ${new Date(invoice.createdAt).toLocaleTimeString()}
            </div>
            <div style="text-align: right;">
              ${invoice.order?.table ? `<strong>Table:</strong> ${invoice.order.table.number}<br>` : ''}
              ${invoice.customerName ? `<strong>Customer:</strong> ${invoice.customerName}<br>` : ''}
              ${invoice.customerPhone ? `<strong>Phone:</strong> ${invoice.customerPhone}` : ''}
            </div>
          </div>

          <div class="items">
            <div class="item" style="font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 5px;">
              <span class="item-name">Item</span>
              <span class="item-qty">Qty</span>
              <span class="item-price">Amount</span>
            </div>
            ${(invoice.order?.items || []).map(item => `
              <div class="item">
                <span class="item-name">${item.menuItem?.name || 'Item'}</span>
                <span class="item-qty">${item.quantity}</span>
                <span class="item-price">${formatCurrency(item.price * item.quantity)}</span>
              </div>
            `).join('')}
          </div>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>${formatCurrency(invoice.subtotal)}</span>
            </div>
            ${taxBreakdown.map((tax: TaxBreakdownItem) => `
              <div class="total-row">
                <span>${tax.name} (${tax.rate}%)</span>
                <span>${formatCurrency(tax.amount)}</span>
              </div>
            `).join('')}
            ${invoice.discount > 0 ? `
              <div class="total-row">
                <span>Discount</span>
                <span>-${formatCurrency(invoice.discount)}</span>
              </div>
            ` : ''}
            ${invoice.tip > 0 ? `
              <div class="total-row">
                <span>Tip</span>
                <span>${formatCurrency(invoice.tip)}</span>
              </div>
            ` : ''}
            <div class="total-row grand">
              <span>Grand Total</span>
              <span>${formatCurrency(invoice.grandTotal)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Payment: ${invoice.paymentMethod || 'N/A'} - ${invoice.paymentStatus}</p>
            <p style="margin-top: 10px;">Thank you for dining with us!</p>
            <p>Please visit again</p>
          </div>

          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const downloadCSV = () => {
    const headers = ['Invoice #', 'Date', 'Customer', 'Subtotal', 'Tax', 'Total', 'Payment Status', 'Payment Method']
    const rows = filteredInvoices.map(inv => [
      inv.invoiceNumber,
      new Date(inv.createdAt).toLocaleDateString(),
      inv.customerName || 'Guest',
      inv.subtotal,
      inv.totalTax,
      inv.grandTotal,
      inv.paymentStatus,
      inv.paymentMethod || 'N/A',
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoices-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addToast({ title: 'Invoices exported successfully', type: 'success' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Calculate summary stats
  const totalRevenue = filteredInvoices.filter(i => i.paymentStatus === 'PAID').reduce((sum, i) => sum + i.grandTotal, 0)
  const totalTaxCollected = filteredInvoices.filter(i => i.paymentStatus === 'PAID').reduce((sum, i) => sum + i.totalTax, 0)
  const pendingAmount = filteredInvoices.filter(i => i.paymentStatus === 'PENDING').reduce((sum, i) => sum + i.grandTotal, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
            <Receipt className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
              Invoices
            </h1>
            <p className="text-gray-500">Manage bills and payment records</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={downloadCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="font-medium opacity-90">Total Revenue</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
          <p className="text-sm opacity-75 mt-1">{filteredInvoices.filter(i => i.paymentStatus === 'PAID').length} paid invoices</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="font-medium opacity-90">Tax Collected</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totalTaxCollected)}</p>
          <p className="text-sm opacity-75 mt-1">From {filteredInvoices.length} invoices</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="font-medium opacity-90">Pending</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(pendingAmount)}</p>
          <p className="text-sm opacity-75 mt-1">{filteredInvoices.filter(i => i.paymentStatus === 'PENDING').length} pending invoices</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by invoice #, customer, phone..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as PaymentStatus | 'ALL'); setCurrentPage(1) }}
              className="px-4 py-2 border rounded-xl bg-white text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => { setDateRange(e.target.value as typeof dateRange); setCurrentPage(1) }}
              className="px-4 py-2 border rounded-xl bg-white text-sm"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-6 py-4 font-medium">Invoice</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Subtotal</th>
                <th className="px-6 py-4 font-medium">Tax</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedInvoices.map((invoice) => {
                const status = getStatusConfig(invoice.paymentStatus)
                const StatusIcon = status.icon
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[var(--text)]">{invoice.invoiceNumber}</p>
                      {invoice.order && (
                        <p className="text-xs text-gray-400">Order: {invoice.order.orderNumber}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[var(--text)]">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(invoice.createdAt).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[var(--text)]">{invoice.customerName || 'Guest'}</p>
                      {invoice.customerPhone && (
                        <p className="text-xs text-gray-400">{invoice.customerPhone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatCurrency(invoice.subtotal)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatCurrency(invoice.totalTax)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[var(--text)]">
                      {formatCurrency(invoice.grandTotal)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="p-2 text-gray-500 hover:text-[var(--primary)] hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(invoice)}
                          className="p-2 text-gray-500 hover:text-[var(--primary)] hover:bg-gray-100 rounded-lg transition-colors"
                          title="Print Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {paginatedInvoices.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No invoices found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = currentPage > 3 ? currentPage - 2 + i : i + 1
                if (page > totalPages) return null
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? 'bg-[var(--primary)] text-white'
                        : 'border hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedInvoice(null)}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text)]">{selectedInvoice.invoiceNumber}</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedInvoice.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrint(selectedInvoice)}
                    className="p-2 text-gray-500 hover:text-[var(--primary)] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Restaurant Info */}
                <div className="text-center pb-4 border-b border-dashed">
                  <h3 className="font-bold text-lg text-[var(--text)]">{restaurant?.name}</h3>
                  {restaurant?.address && <p className="text-sm text-gray-500">{restaurant.address}</p>}
                  <p className="text-sm text-gray-500">{restaurant?.phone} | {restaurant?.email}</p>
                </div>

                {/* Customer & Order Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Customer</p>
                    <p className="font-medium">{selectedInvoice.customerName || 'Guest'}</p>
                    {selectedInvoice.customerPhone && (
                      <p className="text-gray-500">{selectedInvoice.customerPhone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {selectedInvoice.order?.table && (
                      <>
                        <p className="text-gray-500">Table</p>
                        <p className="font-medium">Table {selectedInvoice.order.table.number}</p>
                      </>
                    )}
                    <p className="text-gray-500 mt-2">Order #</p>
                    <p className="font-medium">{selectedInvoice.order?.orderNumber}</p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-semibold text-[var(--text)] mb-3">Items</h4>
                  <div className="space-y-2">
                    {(selectedInvoice.order?.items || []).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">{item.quantity}x</span>
                          <span>{item.menuItem?.name || 'Item'}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  {(selectedInvoice.taxBreakdown as TaxBreakdownItem[] || []).map((tax, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{tax.name} ({tax.rate}%)</span>
                      <span>{formatCurrency(tax.amount)}</span>
                    </div>
                  ))}
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(selectedInvoice.discount)}</span>
                    </div>
                  )}
                  {selectedInvoice.tip > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tip</span>
                      <span>{formatCurrency(selectedInvoice.tip)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Grand Total</span>
                    <span className="text-[var(--primary)]">{formatCurrency(selectedInvoice.grandTotal)}</span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium">{selectedInvoice.paymentMethod || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusConfig(selectedInvoice.paymentStatus).color}`}>
                      {getStatusConfig(selectedInvoice.paymentStatus).label}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handlePrint(selectedInvoice)}
                    className="flex-1"
                  >
                    <Printer className="w-5 h-5 mr-2" />
                    Print Invoice
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

