'use client'

import * as Toast from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import { create } from 'zustand'

interface ToastItem {
  id: string
  title: string
  description?: string
  type?: 'success' | 'error' | 'info' | 'warning'
}

interface ToastStore {
  toasts: ToastItem[]
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = crypto.randomUUID()
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))

export function Toaster() {
  const { toasts, removeToast } = useToast()

  const getToastStyles = (type?: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white'
      case 'error':
        return 'bg-red-500 text-white'
      case 'warning':
        return 'bg-yellow-500 text-white'
      default:
        return 'bg-[var(--text)] text-white'
    }
  }

  return (
    <Toast.Provider swipeDirection="right">
      {toasts.map((toast) => (
        <Toast.Root
          key={toast.id}
          className={`${getToastStyles(toast.type)} rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slideUp`}
          open={true}
          onOpenChange={() => removeToast(toast.id)}
        >
          <div className="flex-1">
            <Toast.Title className="font-semibold">{toast.title}</Toast.Title>
            {toast.description && (
              <Toast.Description className="text-sm opacity-90 mt-1">
                {toast.description}
              </Toast.Description>
            )}
          </div>
          <Toast.Close className="p-1 hover:bg-white/20 rounded">
            <X className="w-4 h-4" />
          </Toast.Close>
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2 w-[380px] max-w-[calc(100vw-2rem)] z-[100]" />
    </Toast.Provider>
  )
}

