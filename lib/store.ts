import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

