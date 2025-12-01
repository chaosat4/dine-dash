'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette,
  Upload,
  TableIcon,
  CreditCard,
  Check,
  ArrowRight,
  ArrowLeft,
  UtensilsCrossed,
  Plus,
  Minus,
  ImageIcon,
  Receipt,
  Percent,
  Trash2,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toaster'

const STEPS = [
  { id: 'brand', title: 'Brand Identity', icon: Palette, description: 'Customize your look' },
  { id: 'currency', title: 'Currency & Taxes', icon: Receipt, description: 'Billing settings' },
  { id: 'tables', title: 'Table Setup', icon: TableIcon, description: 'Configure tables' },
  { id: 'payment', title: 'Payment Setup', icon: CreditCard, description: 'Payment methods' },
  { id: 'complete', title: 'Go Live', icon: Check, description: 'Launch checklist' },
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

const TAX_PRESETS = [
  { name: 'GST', rate: 5, description: 'Goods and Services Tax (5%)' },
  { name: 'GST', rate: 12, description: 'Goods and Services Tax (12%)' },
  { name: 'GST', rate: 18, description: 'Goods and Services Tax (18%)' },
  { name: 'CGST', rate: 2.5, description: 'Central GST' },
  { name: 'SGST', rate: 2.5, description: 'State GST' },
  { name: 'Service Tax', rate: 10, description: 'Service Charge' },
  { name: 'VAT', rate: 5, description: 'Value Added Tax' },
]

const COLOR_PRESETS = [
  { name: 'Classic Red', primary: '#e63946', secondary: '#457b9d', accent: '#f4a261' },
  { name: 'Ocean Blue', primary: '#0077b6', secondary: '#00b4d8', accent: '#90e0ef' },
  { name: 'Forest Green', primary: '#2d6a4f', secondary: '#40916c', accent: '#95d5b2' },
  { name: 'Royal Purple', primary: '#7b2cbf', secondary: '#9d4edd', accent: '#c77dff' },
  { name: 'Sunset Orange', primary: '#f77f00', secondary: '#d62828', accent: '#fcbf49' },
  { name: 'Elegant Gold', primary: '#b08968', secondary: '#7f5539', accent: '#ddb892' },
]

const FONT_OPTIONS = [
  { name: 'Playfair Display', family: 'Playfair Display', style: 'Classic Serif' },
  { name: 'Outfit', family: 'Outfit', style: 'Modern Sans' },
  { name: 'Poppins', family: 'Poppins', style: 'Friendly Sans' },
  { name: 'Cormorant Garamond', family: 'Cormorant Garamond', style: 'Elegant Serif' },
  { name: 'Space Grotesk', family: 'Space Grotesk', style: 'Tech Sans' },
  { name: 'Lora', family: 'Lora', style: 'Warm Serif' },
]

interface TaxItem {
  id: string
  name: string
  rate: number
  isActive: boolean
}

interface SetupData {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  headingFont: string
  bodyFont: string
  logoUrl: string
  welcomeMessage: string
  tagline: string
  // Currency & Tax
  currency: string
  currencySymbol: string
  taxEnabled: boolean
  taxInclusive: boolean
  taxes: TaxItem[]
  // Tables
  tableCount: number
  tablePrefix: string
  paymentMethods: string[]
}

function SetupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const restaurantId = searchParams.get('restaurantId') || ''
  const { addToast } = useToast()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [setupData, setSetupData] = useState<SetupData>({
    primaryColor: '#e63946',
    secondaryColor: '#457b9d',
    accentColor: '#f4a261',
    headingFont: 'Playfair Display',
    bodyFont: 'Outfit',
    logoUrl: '',
    welcomeMessage: 'Welcome to our restaurant!',
    tagline: 'Scan, Order, Enjoy',
    // Currency & Tax
    currency: 'INR',
    currencySymbol: '₹',
    taxEnabled: true,
    taxInclusive: false,
    taxes: [{ id: '1', name: 'GST', rate: 5, isActive: true }],
    // Tables
    tableCount: 10,
    tablePrefix: 'Table',
    paymentMethods: ['cash'],
  })

  const updateSetupData = (updates: Partial<SetupData>) => {
    setSetupData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Final step - complete setup
      setIsLoading(true)
      try {
        const res = await fetch('/api/onboarding/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ restaurantId, ...setupData }),
        })

        if (res.ok) {
          addToast({ title: 'Setup completed! Redirecting to dashboard...', type: 'success' })
          router.push('/dashboard')
        } else {
          addToast({ title: 'Setup failed. Please try again.', type: 'error' })
        }
      } catch (error) {
        addToast({ title: 'Something went wrong', type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const togglePaymentMethod = (method: string) => {
    const methods = setupData.paymentMethods.includes(method)
      ? setupData.paymentMethods.filter(m => m !== method)
      : [...setupData.paymentMethods, method]
    updateSetupData({ paymentMethods: methods })
  }

  return (
    <div className="min-h-screen bg-[#fdf8f5]">
      {/* Progress Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-[var(--text)]">Restaurant Setup</h1>
                <p className="text-sm text-gray-500">Step {currentStep + 1} of {STEPS.length}</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-500 hover:text-[var(--primary)]"
            >
              Skip for now
            </button>
          </div>
          
          {/* Step Progress */}
          <div className="flex gap-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex-1">
                <div
                  className={`h-1 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-[var(--primary)]' : 'bg-gray-200'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex justify-between mb-8 overflow-x-auto hide-scrollbar">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center min-w-[80px] ${
                  index === currentStep
                    ? 'text-[var(--primary)]'
                    : index < currentStep
                    ? 'text-emerald-500'
                    : 'text-gray-300'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                    index === currentStep
                      ? 'bg-[var(--primary)] text-white'
                      : index < currentStep
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs font-medium text-center">{step.title}</span>
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-sm p-6 lg:p-8"
          >
            {currentStep === 0 && (
              <BrandStep data={setupData} updateData={updateSetupData} />
            )}
            {currentStep === 1 && (
              <CurrencyTaxStep data={setupData} updateData={updateSetupData} />
            )}
            {currentStep === 2 && (
              <TablesStep data={setupData} updateData={updateSetupData} />
            )}
            {currentStep === 3 && (
              <PaymentStep data={setupData} togglePayment={togglePaymentMethod} />
            )}
            {currentStep === 4 && (
              <CompleteStep data={setupData} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            onClick={handleBack}
            variant="outline"
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <Button onClick={handleNext} disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Completing...
              </div>
            ) : currentStep === STEPS.length - 1 ? (
              <div className="flex items-center gap-2">
                Launch Restaurant
                <Check className="w-5 h-5" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Continue
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Logo Upload Component
function LogoUpload({ logoUrl, onUpload }: { logoUrl: string; onUpload: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState(logoUrl)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Upload
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

// Step 1: Brand Identity
function BrandStep({ data, updateData }: { data: SetupData; updateData: (updates: Partial<SetupData>) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
          Brand Identity
        </h2>
        <p className="text-gray-500">Customize colors and fonts to match your restaurant's personality</p>
      </div>

      {/* Color Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Color Theme</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => updateData({
                primaryColor: preset.primary,
                secondaryColor: preset.secondary,
                accentColor: preset.accent,
              })}
              className={`p-4 rounded-xl border-2 transition-all ${
                data.primaryColor === preset.primary
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
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={data.primaryColor}
              onChange={(e) => updateData({ primaryColor: e.target.value })}
              className="w-12 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={data.primaryColor}
              onChange={(e) => updateData({ primaryColor: e.target.value })}
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Secondary</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={data.secondaryColor}
              onChange={(e) => updateData({ secondaryColor: e.target.value })}
              className="w-12 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={data.secondaryColor}
              onChange={(e) => updateData({ secondaryColor: e.target.value })}
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Accent</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={data.accentColor}
              onChange={(e) => updateData({ accentColor: e.target.value })}
              className="w-12 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={data.accentColor}
              onChange={(e) => updateData({ accentColor: e.target.value })}
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Font Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Heading Font</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.name}
              onClick={() => updateData({ headingFont: font.name })}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                data.headingFont === font.name
                  ? 'border-[var(--primary)] bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-lg font-bold block mb-1" style={{ fontFamily: font.family }}>
                Aa
              </span>
              <span className="text-xs text-gray-500">{font.style}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Logo Upload */}
      <LogoUpload logoUrl={data.logoUrl} onUpload={(url) => updateData({ logoUrl: url })} />

      {/* Welcome Message */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Welcome Message"
          value={data.welcomeMessage}
          onChange={(e) => updateData({ welcomeMessage: e.target.value })}
          placeholder="Welcome to our restaurant!"
        />
        <Input
          label="Tagline"
          value={data.tagline}
          onChange={(e) => updateData({ tagline: e.target.value })}
          placeholder="Scan, Order, Enjoy"
        />
      </div>
    </div>
  )
}

// Step 2: Currency & Taxes
function CurrencyTaxStep({ data, updateData }: { data: SetupData; updateData: (updates: Partial<SetupData>) => void }) {
  const addTax = () => {
    const newTax: TaxItem = {
      id: Date.now().toString(),
      name: '',
      rate: 0,
      isActive: true,
    }
    updateData({ taxes: [...data.taxes, newTax] })
  }

  const removeTax = (id: string) => {
    updateData({ taxes: data.taxes.filter(t => t.id !== id) })
  }

  const updateTax = (id: string, updates: Partial<TaxItem>) => {
    updateData({
      taxes: data.taxes.map(t => t.id === id ? { ...t, ...updates } : t)
    })
  }

  const addPresetTax = (preset: { name: string; rate: number }) => {
    const exists = data.taxes.some(t => t.name === preset.name && t.rate === preset.rate)
    if (!exists) {
      const newTax: TaxItem = {
        id: Date.now().toString(),
        name: preset.name,
        rate: preset.rate,
        isActive: true,
      }
      updateData({ taxes: [...data.taxes, newTax] })
    }
  }

  const handleCurrencyChange = (code: string) => {
    const currency = CURRENCIES.find(c => c.code === code)
    if (currency) {
      updateData({ currency: currency.code, currencySymbol: currency.symbol })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
          Currency & Tax Settings
        </h2>
        <p className="text-gray-500">Configure billing currency and applicable taxes for invoices</p>
      </div>

      {/* Currency Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Select Currency</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CURRENCIES.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleCurrencyChange(currency.code)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                data.currency === currency.code
                  ? 'border-[var(--primary)] bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold text-[var(--text)]">{currency.symbol}</span>
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
            <label className="block text-sm font-medium text-gray-700">Tax Configuration</label>
            <p className="text-xs text-gray-500">Add taxes that apply to your orders</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.taxEnabled}
                onChange={(e) => updateData({ taxEnabled: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <span className="text-sm text-gray-700">Enable Taxes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.taxInclusive}
                onChange={(e) => updateData({ taxInclusive: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <span className="text-sm text-gray-700">Tax Inclusive Prices</span>
            </label>
          </div>
        </div>

        {data.taxEnabled && (
          <>
            {/* Tax Presets */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-2">Quick Add</label>
              <div className="flex flex-wrap gap-2">
                {TAX_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => addPresetTax(preset)}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {preset.name} ({preset.rate}%)
                  </button>
                ))}
              </div>
            </div>

            {/* Added Taxes */}
            <div className="space-y-3">
              {data.taxes.map((tax) => (
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
                    onClick={() => removeTax(tax.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addTax}
              className="mt-3 flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
            >
              <Plus className="w-4 h-4" />
              Add Custom Tax
            </button>
          </>
        )}
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
        <h3 className="font-semibold text-[var(--text)] mb-4">Invoice Preview</h3>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span>{data.currencySymbol}1,000.00</span>
          </div>
          {data.taxEnabled && data.taxes.filter(t => t.isActive && t.name && t.rate > 0).map((tax) => (
            <div key={tax.id} className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">{tax.name} ({tax.rate}%)</span>
              <span>{data.currencySymbol}{(1000 * tax.rate / 100).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-[var(--primary)]">
              {data.currencySymbol}
              {(1000 + (data.taxEnabled ? data.taxes.filter(t => t.isActive).reduce((sum, t) => sum + (1000 * t.rate / 100), 0) : 0)).toFixed(2)}
            </span>
          </div>
        </div>
        {data.taxInclusive && (
          <p className="text-xs text-gray-500 mt-2 text-center">* All prices include applicable taxes</p>
        )}
      </div>
    </div>
  )
}

// Step 3: Tables Setup
function TablesStep({ data, updateData }: { data: SetupData; updateData: (updates: Partial<SetupData>) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
          Table Configuration
        </h2>
        <p className="text-gray-500">Set up your restaurant tables for QR code ordering</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Number of Tables</label>
          <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
            <button
              onClick={() => updateData({ tableCount: Math.max(1, data.tableCount - 1) })}
              className="w-12 h-12 rounded-xl bg-white border flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="flex-1 text-center text-4xl font-bold text-[var(--text)]">
              {data.tableCount}
            </span>
            <button
              onClick={() => updateData({ tableCount: data.tableCount + 1 })}
              className="w-12 h-12 rounded-xl bg-white border flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <Input
            label="Table Name Prefix"
            value={data.tablePrefix}
            onChange={(e) => updateData({ tablePrefix: e.target.value })}
            placeholder="Table"
          />
          <p className="text-xs text-gray-400 mt-2">
            Tables will be named as "{data.tablePrefix} 1", "{data.tablePrefix} 2", etc.
          </p>
        </div>
      </div>

      {/* Table Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Preview</label>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {Array.from({ length: Math.min(data.tableCount, 20) }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600"
            >
              {i + 1}
            </div>
          ))}
          {data.tableCount > 20 && (
            <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center text-xs text-gray-400">
              +{data.tableCount - 20}
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 flex gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <TableIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-blue-900">QR Codes will be generated</p>
          <p className="text-sm text-blue-700">
            After setup, you can print QR codes for each table from the dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}

// Step 3: Payment Setup
function PaymentStep({ data, togglePayment }: { data: SetupData; togglePayment: (method: string) => void }) {
  const paymentMethods = [
    { id: 'cash', name: 'Cash', description: 'Accept cash payments' },
    { id: 'upi', name: 'UPI', description: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', name: 'Card', description: 'Credit & Debit cards' },
    { id: 'wallet', name: 'Digital Wallet', description: 'Amazon Pay, etc.' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
          Payment Methods
        </h2>
        <p className="text-gray-500">Select the payment options you want to offer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => togglePayment(method.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              data.paymentMethods.includes(method.id)
                ? 'border-[var(--primary)] bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[var(--text)]">{method.name}</span>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  data.paymentMethods.includes(method.id)
                    ? 'border-[var(--primary)] bg-[var(--primary)]'
                    : 'border-gray-300'
                }`}
              >
                {data.paymentMethods.includes(method.id) && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500">{method.description}</p>
          </button>
        ))}
      </div>

      <div className="bg-amber-50 rounded-xl p-4 flex gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="font-medium text-amber-900">Payment Gateway Integration</p>
          <p className="text-sm text-amber-700">
            For online payments, you'll need to connect a payment gateway later in settings.
          </p>
        </div>
      </div>
    </div>
  )
}

// Step 5: Complete
function CompleteStep({ data }: { data: SetupData }) {
  const activeTaxes = data.taxes.filter(t => t.isActive && t.name && t.rate > 0)
  const totalTaxRate = activeTaxes.reduce((sum, t) => sum + t.rate, 0)

  const checklist = [
    { label: 'Brand colors configured', done: true },
    { label: 'Currency & taxes configured', done: data.currency && (!data.taxEnabled || activeTaxes.length > 0) },
    { label: 'Tables set up', done: data.tableCount > 0 },
    { label: 'Payment methods selected', done: data.paymentMethods.length > 0 },
    { label: 'Menu items added', done: false, note: 'Add from dashboard' },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
          Almost Ready!
        </h2>
        <p className="text-gray-500">Review your setup and launch your restaurant</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex gap-2 mb-2">
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: data.primaryColor }} />
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: data.secondaryColor }} />
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: data.accentColor }} />
          </div>
          <p className="text-sm font-medium text-gray-700">Brand Colors</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-[var(--text)]">{data.currencySymbol}</p>
          <p className="text-sm font-medium text-gray-700">{data.currency} Currency</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-[var(--text)]">{data.taxEnabled ? `${totalTaxRate}%` : 'Off'}</p>
          <p className="text-sm font-medium text-gray-700">Total Tax Rate</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-[var(--text)]">{data.tableCount}</p>
          <p className="text-sm font-medium text-gray-700">Tables</p>
        </div>
      </div>

      {/* Tax Details */}
      {data.taxEnabled && activeTaxes.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-medium text-blue-900 mb-2">Configured Taxes</h4>
          <div className="flex flex-wrap gap-2">
            {activeTaxes.map((tax) => (
              <span key={tax.id} className="px-3 py-1 bg-white rounded-full text-sm text-blue-700">
                {tax.name}: {tax.rate}%
              </span>
            ))}
          </div>
          {data.taxInclusive && (
            <p className="text-xs text-blue-600 mt-2">• Prices are tax inclusive</p>
          )}
        </div>
      )}

      {/* Checklist */}
      <div>
        <h3 className="font-semibold text-[var(--text)] mb-4">Go-Live Checklist</h3>
        <div className="space-y-3">
          {checklist.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                item.done ? 'bg-emerald-50' : 'bg-gray-50'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  item.done ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                {item.done && <Check className="w-4 h-4 text-white" />}
              </div>
              <span className={item.done ? 'text-emerald-900' : 'text-gray-600'}>
                {item.label}
              </span>
              {item.note && (
                <span className="text-xs text-gray-400 ml-auto">{item.note}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SetupContent />
    </Suspense>
  )
}

