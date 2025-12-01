// ==================== RESTAURANT & PLATFORM ====================

export interface Restaurant {
  id: string
  name: string
  slug: string
  description?: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country: string
  isActive: boolean
  isVerified: boolean
  subscriptionPlan: SubscriptionPlan
  subscriptionEnd?: string
  
  // Currency & Tax Settings
  currency: string
  currencySymbol: string
  taxEnabled: boolean
  taxInclusive: boolean
  taxSettings?: TaxSetting[]
  
  brandSettings?: BrandSettings
  createdAt: string
  updatedAt: string
}

export interface TaxSetting {
  id: string
  restaurantId: string
  name: string
  rate: number
  isActive: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface BrandSettings {
  id: string
  restaurantId: string
  logoUrl?: string
  faviconUrl?: string
  coverImageUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  headingFont: string
  bodyFont: string
  welcomeMessage?: string
  tagline?: string
  galleryImages: string[]
}

export type SubscriptionPlan = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'

// ==================== STAFF & AUTH ====================

export interface Staff {
  id: string
  restaurantId: string
  restaurant?: Restaurant
  name: string
  email: string
  phone?: string
  role: StaffRole
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export type StaffRole = 'OWNER' | 'MANAGER' | 'CHEF' | 'WAITER'

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  OWNER: 'Owner',
  MANAGER: 'Manager',
  CHEF: 'Kitchen Staff',
  WAITER: 'Waiter',
}

// ==================== CUSTOMER ====================

export interface Customer {
  id: string
  restaurantId: string
  name?: string
  email?: string
  phone: string
  verified: boolean
  totalOrders: number
  totalSpent: number
  lastOrderAt?: string
  createdAt: string
  updatedAt: string
}

// ==================== MENU ====================

export interface MenuItem {
  id: string
  restaurantId: string
  name: string
  description?: string
  price: number
  image?: string
  isVeg: boolean
  isAvailable: boolean
  isFeatured: boolean
  preparationTime?: number
  categoryId: string
  category?: Category
  customizations?: Customization[]
}

export interface Category {
  id: string
  restaurantId: string
  name: string
  description?: string
  image?: string
  sortOrder: number
  isActive: boolean
  items?: MenuItem[]
}

export interface Customization {
  id: string
  name: string
  options: string[]
  required: boolean
}

// ==================== TABLE ====================

export interface Table {
  id: string
  restaurantId: string
  number: number
  name?: string
  capacity: number
  qrCode?: string
  isActive: boolean
}

// ==================== ORDER ====================

export interface Order {
  id: string
  restaurantId: string
  orderNumber: string
  status: OrderStatus
  tableId: string
  table?: Table
  customerId?: string
  customer?: Customer
  customerName?: string
  customerPhone?: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  tip: number
  specialRequests?: string
  estimatedTime?: number
  servedBy?: string
  paymentStatus: PaymentStatus
  paymentMethod?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  menuItem?: MenuItem
  quantity: number
  price: number
  customizations?: Record<string, string>
  notes?: string
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'COMPLETED'
  | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

// ==================== INVOICE ====================

export interface TaxBreakdownItem {
  name: string
  rate: number
  amount: number
}

export interface Invoice {
  id: string
  restaurantId: string
  invoiceNumber: string
  orderId: string
  order?: Order
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  subtotal: number
  taxBreakdown: TaxBreakdownItem[]
  totalTax: number
  discount: number
  tip: number
  grandTotal: number
  paymentMethod?: string
  paymentStatus: PaymentStatus
  paidAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Order Placed',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready to Serve',
  SERVED: 'Served',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-blue-500',
  PREPARING: 'bg-orange-500',
  READY: 'bg-green-500',
  SERVED: 'bg-emerald-600',
  COMPLETED: 'bg-gray-500',
  CANCELLED: 'bg-red-500',
}

// ==================== ANALYTICS ====================

export interface DashboardStats {
  totalOrders: number
  todayOrders: number
  totalRevenue: number
  todayRevenue: number
  averageOrderValue: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  topItems: { name: string; count: number; revenue: number }[]
  hourlyOrders: { hour: number; count: number }[]
  recentOrders: Order[]
}

export interface KitchenStats {
  pendingCount: number
  preparingCount: number
  readyCount: number
  avgPrepTime: number
}
