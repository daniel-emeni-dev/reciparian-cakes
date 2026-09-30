'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { TrackedOrder } from '@/app/components/TrackedOrder'
import {
  trackOrderSchema,
  trackedOrderResponseSchema,
  type TrackOrderInput,
  type TrackedOrderData,
} from '@/lib/validations/track'

const inputClass =
  'mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm'

export function TrackOrderForm({ defaultReference }: { defaultReference: string }) {
  const [result, setResult] = useState<TrackedOrderData | null>(null)
  const [notFound, setNotFound] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TrackOrderInput>({
    resolver: zodResolver(trackOrderSchema),
    defaultValues: { reference: defaultReference, email: '' },
  })

  async function onSubmit(values: TrackOrderInput) {
    setNotFound(false)

    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        cache: 'no-store',
      })

      if (response.status === 404) {
        setResult(null)
        setNotFound(true)
        return
      }
      if (!response.ok) {
        throw new Error(`Track request failed with ${response.status}`)
      }

      const parsed = trackedOrderResponseSchema.safeParse(await response.json())
      if (!parsed.success) {
        throw new Error('Unexpected track response shape')
      }

      setResult(parsed.data.data)
    } catch (error) {
      console.error('Order tracking failed:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6"
        noValidate
      >
        <div>
          <label htmlFor="track-reference" className="text-sm font-medium text-foreground">
            Order reference
          </label>
          <input
            id="track-reference"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            {...register('reference')}
            className={inputClass}
          />
          {errors.reference && <p className="mt-1 text-xs text-danger">{errors.reference.message}</p>}
        </div>

        <div>
          <label htmlFor="track-email" className="text-sm font-medium text-foreground">
            Email used at checkout
          </label>
          <input
            id="track-email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={inputClass}
          />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
        </div>

        {notFound && (
          <p role="alert" className="text-sm text-danger">
            We could not find an order with those details. Check the reference and email and try again.
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? 'Checking...' : 'Track order'}
        </button>
      </form>

      {result && <TrackedOrder order={result.order} items={result.items} />}
    </div>
  )
}
