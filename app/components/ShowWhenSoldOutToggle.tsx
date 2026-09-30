'use client'

import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { setMenuItemShowWhenSoldOut } from '@/app/actions/admin-menu'

interface ShowWhenSoldOutToggleProps {
  menuItemId: string
  itemName: string
  showWhenSoldOut: boolean
}

export function ShowWhenSoldOutToggle({
  menuItemId,
  itemName,
  showWhenSoldOut,
}: ShowWhenSoldOutToggleProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticValue, setOptimisticValue] = useOptimistic(showWhenSoldOut)

  function handleChange() {
    const next = !optimisticValue

    startTransition(async () => {
      setOptimisticValue(next)

      try {
        const result = await setMenuItemShowWhenSoldOut({ menuItemId, showWhenSoldOut: next })
        if (!result.success) {
          toast.error(result.error)
        }
      } catch (error) {
        console.error('Show when sold out toggle failed:', error)
        toast.error('Could not update the item. Please try again.')
      }
    })
  }

  return (
    <label className="mt-1 inline-flex min-h-10 items-center gap-2 text-xs text-muted-foreground">
      <input
        type="checkbox"
        checked={optimisticValue}
        disabled={isPending}
        onChange={handleChange}
        aria-label={`Keep ${itemName} on the menu, greyed out, when sold out`}
        className="h-4 w-4 accent-primary"
      />
      Show greyed out when sold out
    </label>
  )
}