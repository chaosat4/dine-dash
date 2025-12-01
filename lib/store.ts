import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Restaurant, BrandSettings } from '@/types'

export interface CartItem {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  image?: string
  isVeg: boolean
  customizations?: Record<string, string>
  notes?: string
}

export interface UserInfo {
  id?: string
  name?: string
  phone?: string
  verified: boolean
}

interface AppState {
  // Restaurant
  restaurant: Restaurant | null
  setRestaurant: (restaurant: Restaurant | null) => void

  // Table
  tableId: string | null
  tableNumber: number | null
  setTable: (id: string, number: number) => void
  clearTable: () => void

  // Cart
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'id'>) => void
  updateQuantity: (id: string, quantity: number) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number

  // User
  user: UserInfo | null
  setUser: (user: UserInfo) => void
  clearUser: () => void

  // Current Order
  currentOrderId: string | null
  setCurrentOrderId: (id: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Restaurant
      restaurant: null,
      setRestaurant: (restaurant) => set({ restaurant }),

      // Table
      tableId: null,
      tableNumber: null,
      setTable: (id, number) => set({ tableId: id, tableNumber: number }),
      clearTable: () => set({ tableId: null, tableNumber: null }),

      // Cart
      cart: [],
      addToCart: (item) => {
        const cart = get().cart
        const existingIndex = cart.findIndex(
          (i) =>
            i.menuItemId === item.menuItemId &&
            JSON.stringify(i.customizations) === JSON.stringify(item.customizations)
        )

        if (existingIndex > -1) {
          const newCart = [...cart]
          newCart[existingIndex].quantity += item.quantity
          set({ cart: newCart })
        } else {
          set({
            cart: [...cart, { ...item, id: crypto.randomUUID() }],
          })
        }
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id)
          return
        }
        set({
          cart: get().cart.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        })
      },
      removeFromCart: (id) => {
        set({ cart: get().cart.filter((item) => item.id !== id) })
      },
      clearCart: () => set({ cart: [] }),
      getCartTotal: () => {
        return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },
      getCartCount: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0)
      },

      // User
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      // Current Order
      currentOrderId: null,
      setCurrentOrderId: (id) => set({ currentOrderId: id }),
    }),
    {
      name: 'dine-dash-store',
    }
  )
)

// Staff store for dashboard
interface StaffState {
  restaurantId: string | null
  staffId: string | null
  staffName: string | null
  role: 'OWNER' | 'MANAGER' | 'CHEF' | 'WAITER' | null
  setStaff: (data: { restaurantId: string; staffId: string; staffName: string; role: StaffState['role'] }) => void
  clearStaff: () => void
}

export const useStaffStore = create<StaffState>()(
  persist(
    (set) => ({
      restaurantId: null,
      staffId: null,
      staffName: null,
      role: null,
      setStaff: (data) => set(data),
      clearStaff: () => set({ restaurantId: null, staffId: null, staffName: null, role: null }),
    }),
    {
      name: 'dine-dash-staff-store',
    }
  )
)
