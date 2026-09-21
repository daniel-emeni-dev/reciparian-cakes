'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateOrderStatus } from '@/app/actions/admin-orders'
import type { OrderAction, OrderStatus } from '@/lib/admin-orders'

const BASE_BUTTON =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60'

interface AdminOrderActionsProps {
  orderId: string
  actions: OrderAction[]
}

export function AdminOrderActions({ orderId, actions }: AdminOrderActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [activeStatus, setActiveStatus] = useState<OrderStatus | null>(null)
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  const cancelAction = actions.find((action) => action.destructive)
  const forwardActions = actions.filter((action) => !action.destructive)

  if (actions.length === 0) return null

  function runUpdate(action: OrderAction) {
    setActiveStatus(action.status)

    startTransition(async () => {
      try {
        const result = await updateOrderStatus({ orderId, status: action.status })

        if (result.success) {
          toast.success('Order updated.')
        } else {
          toast.error(result.error)
        }
      } catch (error) {
        console.error('Order status update failed:', error)
        toast.error('Could not update the order. Please try again.')
      } finally {
        setActiveStatus(null)
        setConfirmingCancel(false)
      }
    })
  }

  if (confirmingCancel && cancelAction) {
    return (
      <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm">
        <p className="font-semibold text-danger">Cancel this order?</p>
        <p className="mt-1 text-muted-foreground">
          This customer has already paid. Cancelling does not refund them, so refund them from the
          Paystack dashboard.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => runUpdate(cancelAction)}
            className={`${BASE_BUTTON} bg-danger text-primary-foreground hover:opacity-90`}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Yes, cancel order
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirmingCancel(false)}
            className={`${BASE_BUTTON} border border-border bg-surface text-foreground hover:bg-muted`}
          >
            Keep order
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
      {forwardActions.map((action) => (
        <button
          key={action.status}
          type="button"
          disabled={isPending}
          onClick={() => runUpdate(action)}
          className={`${BASE_BUTTON} bg-primary text-primary-foreground hover:bg-brand-espresso-light`}
        >
          {isPending && activeStatus === action.status && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {action.label}
        </button>
      ))}
      {cancelAction && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => setConfirmingCancel(true)}
          className={`${BASE_BUTTON} border border-border bg-surface text-danger hover:bg-danger/10`}
        >
          {cancelAction.label}
        </button>
      )}
    </div>
  )
}