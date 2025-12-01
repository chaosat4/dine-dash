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
]

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
      </motion.div>
    </div>
  )
}

