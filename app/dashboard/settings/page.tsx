'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Building2,
  Palette,
  Upload,
  Save,
  Check,
  Globe,
  Phone,
  Mail,
  MapPin,
  ImageIcon,
  Receipt,
  Percent,
  Trash2,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toaster'
import { useStaffStore } from '@/lib/store'
import type { Restaurant, BrandSettings } from '@/types'

const COLOR_PRESETS = [
  { name: 'Classic Red', primary: '#e63946', secondary: '#457b9d', accent: '#f4a261' },
  { name: 'Ocean Blue', primary: '#0077b6', secondary: '#00b4d8', accent: '#90e0ef' },
  { name: 'Forest Green', primary: '#2d6a4f', secondary: '#40916c', accent: '#95d5b2' },
  { name: 'Royal Purple', primary: '#7b2cbf', secondary: '#9d4edd', accent: '#c77dff' },
  { name: 'Sunset Orange', primary: '#f77f00', secondary: '#d62828', accent: '#fcbf49' },
  { name: 'Elegant Gold', primary: '#b08968', secondary: '#7f5539', accent: '#ddb892' },
]

const TABS = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'billing', label: 'Billing & Taxes', icon: Receipt },
]

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
]

interface TaxItem {
  id: string
  name: string
  rate: number
  isActive: boolean
}

function LogoUploadSettings({ logoUrl, onUpload }: { logoUrl: string; onUpload: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState(logoUrl)

  useEffect(() => {
    setPreview(logoUrl)
  }, [logoUrl])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'logo')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const { url } = await res.json()
        onUpload(url)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">Restaurant Logo</label>
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[var(--primary)] transition-colors">
        {preview ? (
          <div className="relative inline-block">
            <img src={preview} alt="Logo preview" className="w-24 h-24 object-contain mx-auto mb-4 rounded-xl" />
            <button
              type="button"
              onClick={() => { setPreview(''); onUpload('') }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <p className="text-gray-500 mb-2">{preview ? 'Change logo' : 'Drag and drop your logo here, or'}</p>
        <label className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[var(--primary)] text-[var(--primary)] rounded-xl cursor-pointer hover:bg-[var(--primary)] hover:text-white transition-colors">
          <Upload className="w-4 h-4" />
          {isUploading ? 'Uploading...' : 'Browse Files'}
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
        </label>
        <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 2MB</p>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { restaurantId } = useStaffStore()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState('general')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [brandSettings, setBrandSettings] = useState<BrandSettings | null>(null)

  const [generalForm, setGeneralForm] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  })

  const [brandForm, setBrandForm] = useState({
    primaryColor: '#e63946',
    secondaryColor: '#457b9d',
    accentColor: '#f4a261',
    backgroundColor: '#fdf8f5',
    textColor: '#1d3557',
    headingFont: 'Playfair Display',
    bodyFont: 'Outfit',
    logoUrl: '',
    welcomeMessage: '',
    tagline: '',
  })

  const [billingForm, setBillingForm] = useState({
    currency: 'INR',
    currencySymbol: '₹',
    taxEnabled: true,
    taxInclusive: false,
    taxes: [] as TaxItem[],
  })

  useEffect(() => {
    fetchSettings()
  }, [restaurantId])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/dashboard/settings')
      if (res.ok) {
        const data = await res.json()
        setRestaurant(data.restaurant)
        setBrandSettings(data.brandSettings)

        setGeneralForm({
          name: data.restaurant.name || '',
          description: data.restaurant.description || '',
          email: data.restaurant.email || '',
          phone: data.restaurant.phone || '',
          address: data.restaurant.address || '',
          city: data.restaurant.city || '',
          state: data.restaurant.state || '',
          zipCode: data.restaurant.zipCode || '',
        })

        if (data.brandSettings) {
          setBrandForm({
            primaryColor: data.brandSettings.primaryColor,
            secondaryColor: data.brandSettings.secondaryColor,
            accentColor: data.brandSettings.accentColor,
            backgroundColor: data.brandSettings.backgroundColor,
            textColor: data.brandSettings.textColor,
            headingFont: data.brandSettings.headingFont,
            bodyFont: data.brandSettings.bodyFont,
            logoUrl: data.brandSettings.logoUrl || '',
            welcomeMessage: data.brandSettings.welcomeMessage || '',
            tagline: data.brandSettings.tagline || '',
          })
        }

        // Set billing settings
        setBillingForm({
          currency: data.restaurant.currency || 'INR',
          currencySymbol: data.restaurant.currencySymbol || '₹',
          taxEnabled: data.restaurant.taxEnabled ?? true,
          taxInclusive: data.restaurant.taxInclusive ?? false,
          taxes: (data.taxSettings || []).map((t: { id: string; name: string; rate: number; isActive: boolean }) => ({
            id: t.id,
            name: t.name,
            rate: t.rate,
            isActive: t.isActive,
          })),
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveGeneral = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/dashboard/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'general', data: generalForm }),
      })

      if (res.ok) {
        addToast({ title: 'Settings saved successfully', type: 'success' })
      } else {
        addToast({ title: 'Failed to save settings', type: 'error' })
      }
    } catch (error) {
      addToast({ title: 'Failed to save settings', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveBranding = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/dashboard/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'branding', data: brandForm }),
      })

      if (res.ok) {
        addToast({ title: 'Branding updated successfully', type: 'success' })
      } else {
        addToast({ title: 'Failed to update branding', type: 'error' })
      }
    } catch (error) {
      addToast({ title: 'Failed to update branding', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveBilling = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/dashboard/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'billing', data: billingForm }),
      })

      if (res.ok) {
        addToast({ title: 'Billing settings saved successfully', type: 'success' })
      } else {
        addToast({ title: 'Failed to save billing settings', type: 'error' })
      }
    } catch (error) {
      addToast({ title: 'Failed to save billing settings', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCurrencyChange = (code: string) => {
    const currency = CURRENCIES.find(c => c.code === code)
    if (currency) {
      setBillingForm({ ...billingForm, currency: currency.code, currencySymbol: currency.symbol })
    }
  }

  const addTax = () => {
    const newTax: TaxItem = {
      id: Date.now().toString(),
      name: '',
      rate: 0,
      isActive: true,
    }
    setBillingForm({ ...billingForm, taxes: [...billingForm.taxes, newTax] })
  }

  const removeTax = (id: string) => {
    setBillingForm({ ...billingForm, taxes: billingForm.taxes.filter(t => t.id !== id) })
  }

  const updateTax = (id: string, updates: Partial<TaxItem>) => {
    setBillingForm({
      ...billingForm,
      taxes: billingForm.taxes.map(t => t.id === id ? { ...t, ...updates } : t)
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
          <Settings className="w-6 h-6 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
            Restaurant Settings
          </h1>
          <p className="text-gray-500">Manage your restaurant profile and branding</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-6"
      >
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Restaurant Name"
                value={generalForm.name}
                onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                icon={<Building2 className="w-5 h-5" />}
              />
              <Input
                label="Email"
                type="email"
                value={generalForm.email}
                onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                icon={<Mail className="w-5 h-5" />}
              />
            </div>

            <Input
              label="Description"
              value={generalForm.description}
              onChange={(e) => setGeneralForm({ ...generalForm, description: e.target.value })}
              placeholder="Tell customers about your restaurant..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone"
                value={generalForm.phone}
                onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                icon={<Phone className="w-5 h-5" />}
              />
              <Input
                label="Website"
                value={restaurant?.slug ? `${window.location.origin}/r/${restaurant.slug}` : ''}
                disabled
                icon={<Globe className="w-5 h-5" />}
              />
            </div>

            <Input
              label="Address"
              value={generalForm.address}
              onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
              icon={<MapPin className="w-5 h-5" />}
            />

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="City"
                value={generalForm.city}
                onChange={(e) => setGeneralForm({ ...generalForm, city: e.target.value })}
              />
              <Input
                label="State"
                value={generalForm.state}
                onChange={(e) => setGeneralForm({ ...generalForm, state: e.target.value })}
              />
              <Input
                label="ZIP Code"
                value={generalForm.zipCode}
                onChange={(e) => setGeneralForm({ ...generalForm, zipCode: e.target.value })}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveGeneral} disabled={isSaving}>
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="space-y-8">
            {/* Color Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Color Theme</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setBrandForm({
                      ...brandForm,
                      primaryColor: preset.primary,
                      secondaryColor: preset.secondary,
                      accentColor: preset.accent,
                    })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      brandForm.primaryColor === preset.primary
                        ? 'border-[var(--primary)] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex gap-1 mb-2">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.primary }} />
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.secondary }} />
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.accent }} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandForm.primaryColor}
                    onChange={(e) => setBrandForm({ ...brandForm, primaryColor: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandForm.primaryColor}
                    onChange={(e) => setBrandForm({ ...brandForm, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandForm.secondaryColor}
                    onChange={(e) => setBrandForm({ ...brandForm, secondaryColor: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandForm.secondaryColor}
                    onChange={(e) => setBrandForm({ ...brandForm, secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandForm.accentColor}
                    onChange={(e) => setBrandForm({ ...brandForm, accentColor: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandForm.accentColor}
                    onChange={(e) => setBrandForm({ ...brandForm, accentColor: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <LogoUploadSettings
              logoUrl={brandForm.logoUrl}
              onUpload={(url) => setBrandForm({ ...brandForm, logoUrl: url })}
            />

            {/* Welcome Message */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Welcome Message"
                value={brandForm.welcomeMessage}
                onChange={(e) => setBrandForm({ ...brandForm, welcomeMessage: e.target.value })}
                placeholder="Welcome to our restaurant!"
              />
              <Input
                label="Tagline"
                value={brandForm.tagline}
                onChange={(e) => setBrandForm({ ...brandForm, tagline: e.target.value })}
                placeholder="Scan, Order, Enjoy"
              />
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Preview</label>
              <div
                className="rounded-xl p-6 text-center"
                style={{ backgroundColor: brandForm.backgroundColor }}
              >
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${brandForm.primaryColor}, ${brandForm.secondaryColor})` }}
                >
                  <span className="text-white text-2xl">🍽️</span>
                </div>
                <h3
                  className="text-xl font-bold mb-1"
                  style={{ color: brandForm.textColor, fontFamily: brandForm.headingFont }}
                >
                  {generalForm.name || 'Your Restaurant'}
                </h3>
                <p style={{ color: brandForm.accentColor }}>{brandForm.tagline}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveBranding} disabled={isSaving}>
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Branding
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-8">
            {/* Currency Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Currency</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CURRENCIES.map((currency) => (
                  <button
                    key={currency.code}
                    type="button"
                    onClick={() => handleCurrencyChange(currency.code)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      billingForm.currency === currency.code
                        ? 'border-[var(--primary)] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-bold text-[var(--text)]">{currency.symbol}</span>
                      <span className="text-sm font-medium text-gray-600">{currency.code}</span>
                    </div>
                    <span className="text-xs text-gray-500">{currency.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tax Configuration */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tax Settings</label>
                  <p className="text-xs text-gray-500">Configure taxes for invoices and billing</p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={billingForm.taxEnabled}
                      onChange={(e) => setBillingForm({ ...billingForm, taxEnabled: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <span className="text-sm text-gray-700">Enable Taxes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={billingForm.taxInclusive}
                      onChange={(e) => setBillingForm({ ...billingForm, taxInclusive: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <span className="text-sm text-gray-700">Tax Inclusive</span>
                  </label>
                </div>
              </div>

              {billingForm.taxEnabled && (
                <>
                  <div className="space-y-3">
                    {billingForm.taxes.map((tax) => (
                      <div
                        key={tax.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                          <Percent className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={tax.name}
                            onChange={(e) => updateTax(tax.id, { name: e.target.value })}
                            placeholder="Tax Name (e.g., GST)"
                            className="px-3 py-2 border rounded-lg text-sm"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={tax.rate}
                              onChange={(e) => updateTax(tax.id, { rate: parseFloat(e.target.value) || 0 })}
                              placeholder="Rate"
                              className="w-24 px-3 py-2 border rounded-lg text-sm"
                              step="0.1"
                              min="0"
                              max="100"
                            />
                            <span className="text-gray-500">%</span>
                          </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tax.isActive}
                            onChange={(e) => updateTax(tax.id, { isActive: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                          />
                          <span className="text-xs text-gray-500">Active</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeTax(tax.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addTax}
                    className="mt-3 flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
                  >
                    <Plus className="w-4 h-4" />
                    Add Tax
                  </button>
                </>
              )}
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-[var(--text)] mb-4">Invoice Preview</h3>
              <div className="bg-white rounded-lg p-4 shadow-sm max-w-sm">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{billingForm.currencySymbol}1,000.00</span>
                </div>
                {billingForm.taxEnabled && billingForm.taxes.filter(t => t.isActive && t.name && t.rate > 0).map((tax) => (
                  <div key={tax.id} className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">{tax.name} ({tax.rate}%)</span>
                    <span>{billingForm.currencySymbol}{(1000 * tax.rate / 100).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-[var(--primary)]">
                    {billingForm.currencySymbol}
                    {(1000 + (billingForm.taxEnabled ? billingForm.taxes.filter(t => t.isActive).reduce((sum, t) => sum + (1000 * t.rate / 100), 0) : 0)).toFixed(2)}
                  </span>
                </div>
              </div>
              {billingForm.taxInclusive && (
                <p className="text-xs text-gray-500 mt-3">* All prices include applicable taxes</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveBilling} disabled={isSaving}>
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Billing Settings
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

