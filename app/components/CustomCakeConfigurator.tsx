'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { MessageCircle } from 'lucide-react'
import type {
  CakeFinish,
  CustomCakePriceRow,
  CustomCakeFlavorRow,
  CustomCakeAddonRow,
} from '@/app/actions/custom-cake'
import { useCartStore } from '@/lib/store/cart'
import { useCartUIStore } from '@/lib/store/cart-ui'
import { formatNaira } from '@/lib/cart'
import { buildWhatsAppLink } from '@/lib/whatsapp'

interface Props {
  pricing: CustomCakePriceRow[]
  flavors: CustomCakeFlavorRow[]
  addons: CustomCakeAddonRow[]
}

const labelClass = 'text-xs font-medium text-muted-foreground'
const inputClass =
  'mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-brand-pink-medium sm:text-sm'

export function CustomCakeConfigurator({ pricing, flavors, addons }: Props) {
  const [finish, setFinish] = useState<CakeFinish>('buttercream')
  const [flavorName, setFlavorName] = useState<string>(
    flavors.find((f) => f.is_included)?.name ?? flavors[0]?.name ?? ''
  )
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])
  const [customMessage, setCustomMessage] = useState('')

  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartUIStore((state) => state.open)

  const sizesForFinish = useMemo(
    () => pricing.filter((row) => row.finish === finish),
    [pricing, finish]
  )
  const [sizeInches, setSizeInches] = useState<number>(sizesForFinish[0]?.size_inches ?? 7)

  // An add on without a real price cannot be sold online, so it is never shown.
  const orderableAddons = useMemo(() => addons.filter((a) => a.price > 0), [addons])

  const selected = sizesForFinish.find((row) => row.size_inches === sizeInches)
  const selectedFlavor = flavors.find((f) => f.name === flavorName)
  const selectedAddons = orderableAddons.filter((a) => selectedAddonIds.includes(a.id))

  // A null upcharge means the bakery has not confirmed a price, so the
  // flavor can only be ordered through WhatsApp.
  const flavorUpcharge = selectedFlavor?.upcharge_amount ?? null
  const canOrderOnline = flavorUpcharge !== null

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0)
  const runningTotal = (selected?.base_price ?? 0) + (flavorUpcharge ?? 0) + addonsTotal

  function handleFinishChange(next: CakeFinish) {
    setFinish(next)

    const keepsCurrentSize = pricing.some(
      (row) => row.finish === next && row.size_inches === sizeInches
    )
    if (keepsCurrentSize) return

    const firstSize = pricing.find((row) => row.finish === next)?.size_inches
    if (firstSize) setSizeInches(firstSize)
  }

  function toggleAddon(id: string) {
    setSelectedAddonIds((current) =>
      current.includes(id) ? current.filter((a) => a !== id) : [...current, id]
    )
  }

  function handleAddToCart() {
    if (!selected || !canOrderOnline) return

    addItem({
      itemType: 'custom_cake',
      customCakeConfig: {
        finish,
        sizeInches,
        flavor: flavorName,
        // Sorted so the same cake always matches the same cart line.
        addonIds: [...selectedAddonIds].sort(),
        customMessage: customMessage.trim() || undefined,
      },
      itemName: `Custom ${finish} cake (${sizeInches}")`,
      imageUrl: null,
      unitPrice: runningTotal,
    })
    openCart()
    toast.success('Added to cart.')
  }

  const orderLines = [
    'Hello Reciparian, I would like to order a custom cake.',
    `Finish: ${finish}`,
    `Size: ${sizeInches} inches`,
    `Flavor: ${flavorName}`,
  ]
  if (selectedAddons.length > 0) {
    orderLines.push(`Extras: ${selectedAddons.map((a) => a.name).join(', ')}`)
  }
  if (customMessage.trim()) {
    orderLines.push(`Message on cake: ${customMessage.trim()}`)
  }
  const whatsAppOrderLink = buildWhatsAppLink(orderLines.join('\n'))
  const whatsAppQuestionLink = buildWhatsAppLink(
    'Hello Reciparian, I have a question about a custom cake.'
  )

  const includedFlavors = flavors.filter((f) => f.is_included)
  const extraFlavors = flavors.filter((f) => !f.is_included)

  return (
    <div className="rounded-3xl bg-muted p-6 shadow-sm ring-1 ring-border sm:p-8">
      <p className="text-sm text-muted-foreground">
        Prices shown are for a simple design. For toppers, pictures or a bigger design,{' '}
        <a
          href={whatsAppQuestionLink}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-2"
        >
          message us on WhatsApp
        </a>{' '}
        first.
      </p>

      <div className="mt-6">
        <span id="finish-label" className={labelClass}>
          Finish
        </span>
        <div role="group" aria-labelledby="finish-label" className="mt-2 flex gap-2">
          {(['buttercream', 'fondant'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={finish === option}
              onClick={() => handleFinishChange(option)}
              className={`min-h-11 flex-1 rounded-xl px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                finish === option
                  ? 'bg-brand-pink-medium text-brand-espresso'
                  : 'bg-surface text-muted-foreground hover:text-foreground'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <span id="size-label" className={labelClass}>
          Size (diameter)
        </span>
        <div role="group" aria-labelledby="size-label" className="mt-2 flex flex-wrap gap-2">
          {sizesForFinish.map((row) => (
            <button
              key={row.id}
              type="button"
              aria-pressed={sizeInches === row.size_inches}
              onClick={() => setSizeInches(row.size_inches)}
              className={`min-h-10 min-w-12 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                sizeInches === row.size_inches
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface text-muted-foreground hover:text-foreground'
              }`}
            >
              {row.size_inches}&quot;
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="cake-flavor" className={labelClass}>
          Flavor
        </label>
        <select
          id="cake-flavor"
          value={flavorName}
          onChange={(e) => setFlavorName(e.target.value)}
          className={inputClass}
        >
          <optgroup label="Included">
            {includedFlavors.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Extra cost">
            {extraFlavors.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
                {f.upcharge_amount === null
                  ? ' (order on WhatsApp)'
                  : f.upcharge_amount > 0
                    ? ` (+${formatNaira(f.upcharge_amount)})`
                    : ''}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {orderableAddons.length > 0 && (
        <div className="mt-5">
          <span id="extras-label" className={labelClass}>
            Extras
          </span>
          <div role="group" aria-labelledby="extras-label" className="mt-2 space-y-2">
            {orderableAddons.map((addon) => (
              <label
                key={addon.id}
                className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2.5 text-sm text-foreground"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedAddonIds.includes(addon.id)}
                    onChange={() => toggleAddon(addon.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  {addon.name}
                </span>
                <span className="text-muted-foreground">+{formatNaira(addon.price)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        <label htmlFor="cake-message" className={labelClass}>
          Message on cake (optional)
        </label>
        <input
          id="cake-message"
          type="text"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          maxLength={120}
          placeholder="Happy Birthday, Ada!"
          className={inputClass}
        />
      </div>

      <div className="mt-7 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs text-muted-foreground">
            {canOrderOnline ? 'Total' : 'Starting at'}
          </span>
          <AnimatePresence mode="wait">
            <motion.p
              key={`${finish}-${sizeInches}-${flavorName}-${selectedAddonIds.join(',')}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="text-3xl font-semibold text-foreground"
            >
              {selected ? formatNaira(runningTotal) : 'Not available'}
            </motion.p>
          </AnimatePresence>
          {!canOrderOnline && (
            <p className="mt-1 text-xs text-muted-foreground">
              {flavorName} costs more than the base price. Message us on WhatsApp for the exact
              total.
            </p>
          )}
        </div>

        {canOrderOnline ? (
          <button
            type="button"
            disabled={!selected}
            onClick={handleAddToCart}
            className="min-h-11 w-full rounded-xl bg-brand-green px-5 py-2.5 text-sm font-semibold text-brand-espresso transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Add to cart
          </button>
        ) : (
          <a
            href={whatsAppOrderLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-whatsapp px-5 py-2.5 text-sm font-semibold text-whatsapp-foreground transition hover:brightness-95 sm:w-auto"
          >
            <MessageCircle size={16} aria-hidden="true" />
            Order via WhatsApp
          </a>
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Cakes are 4.5 inches high by default. Taller cakes cost more based on design and size.
      </p>
    </div>
  )
}
