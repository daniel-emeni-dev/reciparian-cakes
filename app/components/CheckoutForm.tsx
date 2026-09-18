'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useCartStore, useCartTotals } from '@/lib/store/cart'
import { formatNaira } from '@/lib/cart'
import { checkout } from '@/app/actions/checkout'
import type { DeliveryZone } from '@/app/actions/delivery-zones'

const checkoutFormSchema = z
  .object({
    customerName: z.string().min(2, 'Enter your full name'),
    customerEmail: z.string().email('Enter a valid email'),
    customerPhone: z.string().min(7, 'Enter a valid phone number'),
    fulfillmentType: z.enum(['delivery', 'pickup']),
    deliveryZoneId: z.string().optional(),
    deliveryAddress: z.string().optional(),
    pickupNotes: z.string().optional(),
  })
  .refine(
    (data) =>
      data.fulfillmentType === 'pickup' ||
      (!!data.deliveryZoneId && !!data.deliveryAddress && data.deliveryAddress.length >= 5),
    {
      message: 'Select a delivery zone and enter your address',
      path: ['deliveryAddress'],
    }
  )

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>

export function CheckoutForm({ zones }: { zones: DeliveryZone[] }) {
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const totals = useCartTotals()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const phZones = useMemo(() => zones.filter((z) => z.zone_tier === 'ph_neighborhood'), [zones])
  const lgaZones = useMemo(() => zones.filter((z) => z.zone_tier === 'lga'), [zones])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: { fulfillmentType: 'delivery' },
  })

  const fulfillmentType = watch('fulfillmentType')
  const selectedZoneId = watch('deliveryZoneId')
  const selectedZone = zones.find((z) => z.id === selectedZoneId)

  async function onSubmit(values: CheckoutFormValues) {
    if (items.length === 0) {
      toast.error('Your cart is empty.')
      return
    }

    setIsSubmitting(true)

    const result = await checkout({
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      customerPhone: values.customerPhone,
      fulfillmentType: values.fulfillmentType,
      deliveryZoneId: values.fulfillmentType === 'delivery' ? values.deliveryZoneId : undefined,
      deliveryAddress: values.fulfillmentType === 'delivery' ? values.deliveryAddress : undefined,
      pickupNotes: values.fulfillmentType === 'pickup' ? values.pickupNotes : undefined,
      items: items.map((item) => ({
        itemType: item.itemType,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        customCakeConfig: item.customCakeConfig,
      })),
    })

    setIsSubmitting(false)

    if (!result.success || !result.authorizationUrl) {
      toast.error(result.error ?? 'Something went wrong. Please try again.')
      return
    }

    // Cart clears once payment is actually confirmed by the webhook,
    // not here — if the customer abandons the Paystack page, their
    // cart should still be waiting for them.
    window.location.href = result.authorizationUrl
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
        <p className="text-stone-600">Your cart is empty.</p>
        <a
          href="/menu"
          className="mt-4 inline-block rounded-xl bg-brand-green px-5 py-2.5 text-sm font-semibold text-stone-900 hover:brightness-95"
        >
          Browse the menu
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Order summary — fully editable, same as the cart drawer */}
      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-stone-500">Order Summary</h2>
        <ul className="divide-y divide-stone-100">
          {items.map((item) => (
            <li key={item.cartItemId} className="flex items-center justify-between gap-3 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-700">{item.itemName}</p>
                <p className="text-xs text-stone-500">{formatNaira(item.unitPrice)} each</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                  aria-label={`Decrease quantity of ${item.itemName}`}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-300 text-stone-600 hover:bg-stone-50"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                  aria-label={`Increase quantity of ${item.itemName}`}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-300 text-stone-600 hover:bg-stone-50"
                >
                  +
                </button>
              </div>

              <span className="w-20 text-right text-sm font-medium text-stone-900">
                {formatNaira(item.unitPrice * item.quantity)}
              </span>

              <button
                type="button"
                onClick={() => removeItem(item.cartItemId)}
                aria-label={`Remove ${item.itemName}`}
                className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-stone-100 pt-3 text-sm">
          <span className="text-stone-600">Subtotal</span>
          <span className="font-semibold text-stone-900">{formatNaira(totals.subtotal)}</span>
        </div>
        {fulfillmentType === 'delivery' && selectedZone && (
          <div className="flex justify-between pt-1 text-sm">
            <span className="text-stone-600">Delivery ({selectedZone.name})</span>
            <span className="font-semibold text-stone-900">{formatNaira(selectedZone.fee)}</span>
          </div>
        )}
        <div className="mt-2 flex justify-between border-t border-stone-100 pt-2 text-base">
          <span className="font-bold text-stone-900">Total</span>
          <span className="font-bold text-stone-900">
            {formatNaira(
              totals.subtotal + (fulfillmentType === 'delivery' ? selectedZone?.fee ?? 0 : 0)
            )}
          </span>
        </div>
      </div>

      {/* Customer details */}
      <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-stone-500">Your Details</h2>

        <div>
          <label className="text-sm font-medium text-stone-700">Full name</label>
          <input
            {...register('customerName')}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-pink-medium focus:ring-2 focus:ring-brand-pink-medium"
          />
          {errors.customerName && (
            <p className="mt-1 text-xs text-red-600">{errors.customerName.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">Email</label>
          <input
            type="email"
            {...register('customerEmail')}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-pink-medium focus:ring-2 focus:ring-brand-pink-medium"
          />
          {errors.customerEmail && (
            <p className="mt-1 text-xs text-red-600">{errors.customerEmail.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">Phone number</label>
          <input
            type="tel"
            placeholder="0803..."
            {...register('customerPhone')}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-pink-medium focus:ring-2 focus:ring-brand-pink-medium"
          />
          {errors.customerPhone && (
            <p className="mt-1 text-xs text-red-600">{errors.customerPhone.message}</p>
          )}
        </div>
      </div>

      {/* Fulfillment */}
      <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-stone-500">Delivery or Pickup</h2>

        <div className="flex gap-2 rounded-xl bg-stone-100 p-1">
          <label
            className={`flex-1 cursor-pointer rounded-lg py-2 text-center text-sm font-medium transition-colors ${
              fulfillmentType === 'delivery' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
            }`}
          >
            <input type="radio" value="delivery" {...register('fulfillmentType')} className="sr-only" />
            Delivery
          </label>
          <label
            className={`flex-1 cursor-pointer rounded-lg py-2 text-center text-sm font-medium transition-colors ${
              fulfillmentType === 'pickup' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
            }`}
          >
            <input type="radio" value="pickup" {...register('fulfillmentType')} className="sr-only" />
            Pickup
          </label>
        </div>

        {fulfillmentType === 'delivery' ? (
          <>
            <div>
              <label className="text-sm font-medium text-stone-700">Delivery zone</label>
              <select
                {...register('deliveryZoneId')}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-pink-medium focus:ring-2 focus:ring-brand-pink-medium"
              >
                <option value="">Select your area</option>
                <optgroup label="Port Harcourt Areas">
                  {phZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} — {formatNaira(zone.fee)}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Other Rivers State LGAs">
                  {lgaZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} — {formatNaira(zone.fee)}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700">Delivery address</label>
              <textarea
                {...register('deliveryAddress')}
                rows={3}
                placeholder="Street, landmark, additional directions..."
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-pink-medium focus:ring-2 focus:ring-brand-pink-medium"
              />
              {errors.deliveryAddress && (
                <p className="mt-1 text-xs text-red-600">{errors.deliveryAddress.message}</p>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg bg-brand-cream p-4 text-sm text-stone-700">
              <p className="font-semibold">Pickup at Reciparian Cakes</p>
              <p className="mt-1">4 George Amewhule Street, Rumuigbo, Port Harcourt</p>
              <p className="mt-1">Mon–Sat, 9:00 AM – 5:30 PM (closed Sundays)</p>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700">
                Notes for pickup (optional)
              </label>
              <textarea
                {...register('pickupNotes')}
                rows={2}
                placeholder="Preferred pickup time, anything the bakery should know..."
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-pink-medium focus:ring-2 focus:ring-brand-pink-medium"
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
      >
        {isSubmitting ? 'Redirecting to payment...' : 'Proceed to Payment'}
      </button>
    </form>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m2 0v13a1 1 0 01-1 1H7a1 1 0 01-1-1V7h12zM10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
