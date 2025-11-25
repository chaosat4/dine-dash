export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  isVeg: boolean
  isAvailable: boolean
  categoryId: string
  category?: Category
  customizations?: Customization[]
}

export interface Category {
  id: string
  name: string
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

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  tableId: string
  table?: Table
  customerName?: string
  customerPhone?: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  specialRequests?: string
  estimatedTime?: number
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

export interface Table {
  id: string
  number: number
  qrCode?: string
  isActive: boolean
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

