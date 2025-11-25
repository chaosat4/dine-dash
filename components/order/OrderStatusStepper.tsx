'use client'

import { Check, Clock, ChefHat, Bell, UtensilsCrossed, CircleCheck, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'

interface OrderStatusStepperProps {
  status: OrderStatus
  vertical?: boolean
}

const steps = [
  { status: 'PENDING', label: 'Order Placed', icon: Clock },
  { status: 'CONFIRMED', label: 'Confirmed', icon: Check },
  { status: 'PREPARING', label: 'Preparing', icon: ChefHat },
  { status: 'READY', label: 'Ready', icon: Bell },
  { status: 'SERVED', label: 'Served', icon: UtensilsCrossed },
]

export function OrderStatusStepper({ status, vertical = false }: OrderStatusStepperProps) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center justify-center gap-3 p-6 bg-red-50 rounded-2xl">
        <XCircle className="w-8 h-8 text-red-500" />
        <span className="text-lg font-semibold text-red-600">Order Cancelled</span>
      </div>
    )
  }

  if (status === 'COMPLETED') {
    return (
      <div className="flex items-center justify-center gap-3 p-6 bg-green-50 rounded-2xl">
        <CircleCheck className="w-8 h-8 text-green-500" />
        <span className="text-lg font-semibold text-green-600">Order Completed</span>
      </div>
    )
  }

  const currentStepIndex = steps.findIndex((s) => s.status === status)

  if (vertical) {
    return (
      <div className="space-y-0">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const Icon = step.icon

          return (
            <div key={step.status} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    isCompleted && 'bg-green-500 text-white',
                    isCurrent && 'bg-[var(--primary)] text-white animate-pulse-slow',
                    !isCompleted && !isCurrent && 'bg-gray-200 text-gray-400'
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-0.5 h-12 transition-colors',
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
              <div className="pt-2">
                <p
                  className={cn(
                    'font-medium',
                    isCurrent && 'text-[var(--primary)]',
                    isCompleted && 'text-green-600',
                    !isCompleted && !isCurrent && 'text-gray-400'
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Background line */}
      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 mx-10" />
      
      {/* Active line */}
      <div
        className="absolute top-5 left-0 h-1 bg-[var(--primary)] mx-10 transition-all duration-500"
        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
      />

      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const Icon = step.icon

          return (
            <div key={step.status} className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 bg-white',
                  isCompleted && 'bg-green-500 text-white',
                  isCurrent && 'bg-[var(--primary)] text-white animate-pulse-slow',
                  !isCompleted && !isCurrent && 'bg-gray-200 text-gray-400 border-2 border-gray-200'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <p
                className={cn(
                  'text-xs mt-2 text-center max-w-[60px]',
                  isCurrent && 'text-[var(--primary)] font-medium',
                  isCompleted && 'text-green-600',
                  !isCompleted && !isCurrent && 'text-gray-400'
                )}
              >
                {step.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

