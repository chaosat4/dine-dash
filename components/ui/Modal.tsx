'use client'

import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  fullScreen?: boolean
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  children,
  fullScreen = false,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-fadeIn" />
        <Dialog.Content
          className={cn(
            'fixed z-50 bg-white focus:outline-none',
            fullScreen
              ? 'inset-0 sm:inset-4 sm:rounded-2xl'
              : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-lg rounded-2xl max-h-[90vh] overflow-hidden',
            'animate-slideUp',
            className
          )}
        >
          {title ? (
            <div className="flex items-center justify-between p-4 border-b">
              <Dialog.Title className="text-lg font-semibold text-[var(--text)]">
                {title}
              </Dialog.Title>
              <Dialog.Close className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>
          ) : (
            <>
              <VisuallyHidden.Root>
                <Dialog.Title>Dialog</Dialog.Title>
              </VisuallyHidden.Root>
              <Dialog.Close className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </>
          )}
          <div className={cn('overflow-y-auto', !fullScreen && 'max-h-[calc(90vh-60px)]')}>
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

