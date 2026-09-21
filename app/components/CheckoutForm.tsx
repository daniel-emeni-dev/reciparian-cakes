'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore, useCartTotals } from '@/lib/store/cart'
import { calculateLineTotal, calculateTotals, formatNaira } from '@/lib/cart'
import { checkout } from '@/app/actions/checkout'
import type { DeliveryZone } from '@/app/actions/delivery-zones'
import { useHasMounted } from '@/lib/hooks/use-has-mounted'
import { EmptyCartState } from '@/app/components/EmptyCartState'

const checkoutFormSchema = z
  .object({
    customerName: z.string().trim().min(2, 'Enter your full name'),
    customerEmail: z.string().trim().email('Enter a valid email'),
    customerPhone: z
      .string()
      .trim()
      .refine((value) => /^\+?\d{10,14}$/.test(value.replace(/\s/g, '')), 'Enter a valid phone number'),
    fulfillmentType: z.enum(['delivery', 'pickup']),
    deliveryZoneId: z.string().optional(),
    deliveryAddress: z.string().trim().optional(),
    pickupNotes: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fulfillmentType !== 'delivery') return

    if (!data.deliveryZoneId) {
      ctx.addIssue({ code: 'custom', path: ['deliveryZoneId'], message: 'Select your delivery zone' })
    }
    if (!data.deliveryAddress || data.deliveryAddress.length < 5) {
      ctx.addIssue({ code: 'custom', path: ['deliveryAddress'], message: 'Enter your delivery address' })
    }
  })

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>

const cardClass = 'rounded-xl border border-border bg-surface p-5'
const labelClass = 'text-sm font-medium text-foreground'
const inputClass =
  'mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-foreground outline-none focus:border-brand-pink-medium focus:ring-2 focus:ring-brand-pink-medium sm:text-sm'
const stepperButtonClass =
  'flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'

// The persisted cart only exists in the browser, so the server render and
// the first client render must match (skeleton) before showing real items.

export function CheckoutForm({ zones }: { zones: DeliveryZone[] }) {
  const hasMounted = useHasMounted()
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const cartTotals = useCartTotals()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const hasZones = zones.length > 0
  const phZones = zones.filter((zone) => zone.zone_tier === 'ph_neighborhood')
  const lgaZones = zones.filter((zone) => zone.zone_tier === 'lga')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      fulfillmentType: hasZones ? 'delivery' : 'pickup',
      deliveryZoneId: '',
      deliveryAddress: '',
      pickupNotes: '',
    },
  })

  const fulfillmentType = watch('fulfillmentType')
  const selectedZone = zones.find((zone) => zone.id === watch('deliveryZoneId'))
  const deliveryFee = fulfillmentType === 'delivery' ? (selectedZone?.fee ?? 0) : 0
  const { subtotal, total } = calculateTotals(cartTotals.subtotal, deliveryFee)
  const isBusy = isSubmitting || isRedirecting

  async function onSubmit(values: CheckoutFormValues) {
    if (items.length === 0) {
      toast.error('Your cart is empty.')
      return
    }

    try {
      const result = await checkout({
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone.replace(/\s/g, ''),
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

      if (!result.success || !result.authorizationUrl) {
        toast.error(result.error ?? 'Something went wrong. Please try again.')
        return
      }

      // Keeps the button locked until the browser leaves the page, so a
      // second tap cannot create a second order.
      setIsRedirecting(true)

      // The cart clears when the webhook confirms payment, not here, so a
      // customer who abandons the Paystack page still has their cart.
      window.location.href = result.authorizationUrl
    } catch (error) {
      console.error('Checkout submission failed:', error)
      toast.error('We could not place your order. Check your connection and try again.')
    }
  }

  if (!hasMounted) {
    return <CheckoutSkeleton />
  }

    if (items.length === 0) {
    return (
      <div className={cardClass}>
        <EmptyCartState />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <section className={cardClass}>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Order Summary</h2>
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.cartItemId} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.itemName}</p>
                  <p className="text-xs text-muted-foreground">{formatNaira(item.unitPrice)} each</p>
                  {item.minQuantity > 1 && (
                    <p className="text-xs text-muted-foreground">Minimum order {item.minQuantity}</p>
                  )}
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatNaira(calculateLineTotal(item.unitPrice, item.quantity))}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    aria-label={`Decrease quantity of ${item.itemName}`}
                    disabled={item.minQuantity > 1 && item.quantity <= item.minQuantity}
                    className={stepperButtonClass}
                  >
                    <Minus size={14} aria-hidden="true" />
                  </button>
                  <span className="w-6 text-center text-sm text-foreground">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    aria-label={`Increase quantity of ${item.itemName}`}
                    className={stepperButtonClass}
                  >
                    <Plus size={14} aria-hidden="true" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.cartItemId)}
                  aria-label={`Remove ${item.itemName}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-danger"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold text-foreground">{formatNaira(subtotal)}</span>
          </div>
          {fulfillmentType === 'delivery' && selectedZone && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery ({selectedZone.name})</span>
              <span className="font-semibold text-foreground">{formatNaira(deliveryFee)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 text-base">
            <span className="font-bold text-foreground">Total</span>
            <span className="font-bold text-foreground">{formatNaira(total)}</span>
          </div>
        </div>
      </section>

      <section className={`${cardClass} space-y-4`}>
        <h2 className="text-sm font-semibold text-muted-foreground">Your Details</h2>

        <div>
          <label htmlFor="customerName" className={labelClass}>
            Full name
          </label>
          <input
            id="customerName"
            autoComplete="name"
            {...register('customerName')}
            className={inputClass}
          />
          <FieldError message={errors.customerName?.message} />
        </div>

        <div>
          <label htmlFor="customerEmail" className={labelClass}>
            Email
          </label>
          <input
            id="customerEmail"
            type="email"
            autoComplete="email"
            {...register('customerEmail')}
            className={inputClass}
          />
          <FieldError message={errors.customerEmail?.message} />
        </div>

        <div>
          <label htmlFor="customerPhone" className={labelClass}>
            Phone number
          </label>
          <input
            id="customerPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0803 000 0000"
            {...register('customerPhone')}
            className={inputClass}
          />
          <FieldError message={errors.customerPhone?.message} />
        </div>
      </section>

      <section className={`${cardClass} space-y-4`}>
        <h2 className="text-sm font-semibold text-muted-foreground">Delivery or Pickup</h2>

        <div className="flex gap-2 rounded-xl bg-muted p-1">
          <label
            className={`flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-pink-medium ${hasZones ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              } ${fulfillmentType === 'delivery' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            <input
              type="radio"
              value="delivery"
              disabled={!hasZones}
              {...register('fulfillmentType')}
              className="sr-only"
            />
            Delivery
          </label>
          <label
            className={`flex-1 cursor-pointer rounded-lg py-2 text-center text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-pink-medium ${fulfillmentType === 'pickup' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
          >
            <input type="radio" value="pickup" {...register('fulfillmentType')} className="sr-only" />
            Pickup
          </label>
        </div>

        {!hasZones && (
          <p className="text-xs text-muted-foreground">
            Delivery is unavailable right now. You can still order for pickup.
          </p>
        )}

        {fulfillmentType === 'delivery' ? (
          <>
            <div>
              <label htmlFor="deliveryZoneId" className={labelClass}>
                Delivery zone
              </label>
              <select id="deliveryZoneId" {...register('deliveryZoneId')} className={inputClass}>
                <option value="">Select your area</option>
                {phZones.length > 0 && (
                  <optgroup label="Port Harcourt Areas">
                    {phZones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} ({formatNaira(zone.fee)})
                      </option>
                    ))}
                  </optgroup>
                )}
                {lgaZones.length > 0 && (
                  <optgroup label="Other Rivers State LGAs">
                    {lgaZones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} ({formatNaira(zone.fee)})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <FieldError message={errors.deliveryZoneId?.message} />
            </div>

            <div>
              <label htmlFor="deliveryAddress" className={labelClass}>
                Delivery address
              </label>
              <textarea
                id="deliveryAddress"
                rows={3}
                autoComplete="street-address"
                placeholder="Street, landmark, additional directions"
                {...register('deliveryAddress')}
                className={inputClass}
              />
              <FieldError message={errors.deliveryAddress?.message} />
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg bg-muted p-4 text-sm text-foreground">
              <p className="font-semibold">Pickup at Reciparian Cakes</p>
              <p className="mt-1">4 George Amewhule Street, Rumuigbo, Port Harcourt</p>
              <p className="mt-1">Monday to Saturday, 9:00 AM to 5:30 PM. Closed on Sundays.</p>
            </div>
            <div>
              <label htmlFor="pickupNotes" className={labelClass}>
                Notes for pickup (optional)
              </label>
              <textarea
                id="pickupNotes"
                rows={2}
                placeholder="Preferred pickup time, anything the bakery should know"
                {...register('pickupNotes')}
                className={inputClass}
              />
            </div>
          </div>
        )}
      </section>

      <button
        type="submit"
        disabled={isBusy}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isBusy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
        {isRedirecting
          ? 'Redirecting to payment'
          : isSubmitting
            ? 'Placing your order'
            : 'Proceed to Payment'}
      </button>
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p role="alert" className="mt-1 text-xs text-danger">
      {message}
    </p>
  )
}

function CheckoutSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden="true">
      <div className="h-56 rounded-xl bg-muted" />
      <div className="h-64 rounded-xl bg-muted" />
      <div className="h-48 rounded-xl bg-muted" />
      <div className="h-12 rounded-xl bg-muted" />
    </div>
  )
}