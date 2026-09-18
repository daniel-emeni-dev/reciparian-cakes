'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type {
  CakeFinish,
  CustomCakePriceRow,
  CustomCakeFlavorRow,
  CustomCakeAddonRow,
} from '@/app/actions/custom-cake'
import { useCartStore } from '@/lib/store/cart'
import { useCartUIStore } from '@/lib/store/cart-ui'
import { formatNaira } from '@/lib/cart'

interface Props {
  pricing: CustomCakePriceRow[]
  flavors: CustomCakeFlavorRow[]
  addons: CustomCakeAddonRow[]
}

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

  const selected = sizesForFinish.find((row) => row.size_inches === sizeInches)
  const selectedFlavor = flavors.find((f) => f.name === flavorName)
  const selectedAddons = addons.filter((a) => selectedAddonIds.includes(a.id))

  const knownAddonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0)
  const flavorUpcharge = selectedFlavor?.upcharge_amount ?? 0
  const hasUnconfirmedCost =
    (selectedFlavor && !selectedFlavor.is_included && selectedFlavor.upcharge_amount === null) ||
    selectedAddonIds.length > 0 && selectedAddons.some((a) => a.price === 0)

  const runningTotal = (selected?.base_price ?? 0) + flavorUpcharge + knownAddonsTotal

  function handleFinishChange(next: CakeFinish) {
    setFinish(next)
    const firstSize = pricing.find((row) => row.finish === next)?.size_inches
    if (firstSize) setSizeInches(firstSize)
  }

  function toggleAddon(id: string) {
    setSelectedAddonIds((current) =>
      current.includes(id) ? current.filter((a) => a !== id) : [...current, id]
    )
  }

  function handleAddToCart() {
    if (!selected) return

    addItem({
      itemType: 'custom_cake',
      customCakeConfig: {
        finish,
        sizeInches,
        flavor: flavorName,
        addonIds: selectedAddonIds,
        customMessage: customMessage || undefined,
      },
      itemName: `Custom ${finish} cake (${sizeInches}")`,
      imageUrl: null,
      unitPrice: runningTotal,
    })
    openCart()
    toast.success('Added to cart — final price confirmed by the bakery before payment.')
  }

  return (
    <div className="rounded-3xl bg-brand-cream p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
      <p className="text-sm text-stone-600">
        Prices shown are the starting point for a simple design. Toppers, pictures, and
        extra flavors may add to the total — we&apos;ll confirm the exact amount with you
        directly before your cake is baked.
      </p>

      {/* Finish */}
      <div className="mt-6">
        <span className="text-xs font-medium text-stone-500">Finish</span>
        <div className="mt-2 flex gap-2">
          {(['buttercream', 'fondant'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleFinishChange(option)}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                finish === option ? 'bg-brand-pink-medium text-stone-900' : 'bg-white text-stone-500 hover:bg-stone-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="mt-5">
        <span className="text-xs font-medium text-stone-500">Size (diameter)</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {sizesForFinish.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setSizeInches(row.size_inches)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                sizeInches === row.size_inches
                  ? 'bg-brand-espresso text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              {row.size_inches}&quot;
            </button>
          ))}
        </div>
      </div>

      {/* Flavor */}
      <div className="mt-5">
        <span className="text-xs font-medium text-stone-500">Flavor</span>
        <select
          value={flavorName}
          onChange={(e) => setFlavorName(e.target.value)}
          className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-pink-medium"
        >
          <optgroup label="Included">
            {flavors
              .filter((f) => f.is_included)
              .map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name}
                </option>
              ))}
          </optgroup>
          <optgroup label="Extra cost">
            {flavors
              .filter((f) => !f.is_included)
              .map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name}
                  {f.upcharge_amount ? ` (+${formatNaira(f.upcharge_amount)})` : ''}
                </option>
              ))}
          </optgroup>
        </select>
      </div>

      {/* Add-ons */}
      {addons.length > 0 && (
        <div className="mt-5">
          <span className="text-xs font-medium text-stone-500">Add-ons</span>
          <div className="mt-2 space-y-2">
            {addons.map((addon) => (
              <label
                key={addon.id}
                className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedAddonIds.includes(addon.id)}
                    onChange={() => toggleAddon(addon.id)}
                    className="rounded border-stone-300"
                  />
                  {addon.name}
                </span>
                <span className="text-stone-500">
                  {addon.price > 0 ? `+${formatNaira(addon.price)}` : 'Price on request'}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Custom message */}
      <div className="mt-5">
        <label className="text-xs font-medium text-stone-500">Message on cake (optional)</label>
        <input
          type="text"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          maxLength={120}
          placeholder="Happy Birthday, Ada!"
          className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink-medium"
        />
      </div>

      {/* Price + CTA */}
      <div className="mt-7 flex items-end justify-between border-t border-stone-200 pt-5">
        <div>
          <span className="text-xs text-stone-500">
            {hasUnconfirmedCost ? 'Starting at' : 'Total'}
          </span>
          <AnimatePresence mode="wait">
            <motion.p
              key={`${finish}-${sizeInches}-${flavorName}-${selectedAddonIds.join(',')}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="text-3xl font-semibold text-stone-900"
            >
              {selected ? formatNaira(runningTotal) : '—'}
            </motion.p>
          </AnimatePresence>
          {hasUnconfirmedCost && (
            <p className="mt-1 text-xs text-stone-500">
              This selection costs more than the base price — we&apos;ll confirm the exact
              total with you before baking.
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={!selected}
          onClick={handleAddToCart}
          className="rounded-xl bg-brand-green px-5 py-2.5 text-sm font-semibold text-stone-900 transition-colors hover:brightness-95 disabled:opacity-50"
        >
          Add to cart
        </button>
      </div>

      <p className="mt-3 text-xs text-stone-500">
        Cakes are 4.5&quot; high by default — taller cakes cost more based on design and size.
      </p>
    </div>
  )
}
