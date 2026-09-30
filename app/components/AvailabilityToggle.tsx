'use client'

import { useOptimistic, useTransition } from 'react'
import { clsx } from 'clsx'
import { toast } from 'sonner'
import { setMenuItemAvailability } from '@/app/actions/admin-menu'


interface AvailabilityToggleProps {
  menuItemId: string
  itemName: string
  isAvailable: boolean
}

export function AvailabilityToggle({ menuItemId, itemName, isAvailable }: AvailabilityToggleProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticAvailable, setOptimisticAvailable] = useOptimistic(isAvailable)

  function handleToggle() {
    const next = !optimisticAvailable

    startTransition(async () => {
      setOptimisticAvailable(next)

      try {
        const result = await setMenuItemAvailability({ menuItemId, isAvailable: next })
        if (!result.success) {
          toast.error(result.error)
        }
      } catch (error) {
        console.error('Availability toggle failed:', error)
        toast.error('Could not update the item. Please try again.')
      }
    })
  }

  return (
    <div className="flex shrink-0 items-center gap-3">
      <span
        className={clsx(
          'w-16 text-right text-sm font-medium',
          optimisticAvailable ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {optimisticAvailable ? 'Available' : 'Sold out'}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={optimisticAvailable}
        aria-label={`${itemName} is available`}
        disabled={isPending}
        onClick={handleToggle}
        className={clsx(
          'relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors disabled:opacity-70',
          optimisticAvailable ? 'bg-primary' : 'bg-muted-foreground/40'
        )}
      >
        <span
          aria-hidden="true"
          className={clsx(
            'inline-block h-6 w-6 rounded-full bg-primary-foreground shadow transition-transform',
            optimisticAvailable ? 'translate-x-7' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  )
}