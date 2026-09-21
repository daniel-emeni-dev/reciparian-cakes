'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Cake, X } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { useCartUIStore } from '@/lib/store/cart-ui'
import { formatNaira } from '@/lib/cart'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number // kobo
  image_url: string | null
  image_alt_text: string
  dietary_tags: string[]
  stock_count: number | null
  min_quantity: number
  categories: { name: string; slug: string } | null
}

interface Category {
  id: string
  name: string
  slug: string
}

const pillClass =
  'inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors'
const pillActiveClass = 'bg-brand-pink-medium text-brand-espresso'
const pillIdleClass = 'bg-muted text-muted-foreground hover:text-foreground'

export function InteractiveMenu({
  initialItems,
  categories,
}: {
  initialItems: MenuItem[]
  categories: Category[]
}) {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Reads ?category= on first load so links from the home page's
  // category cards land pre-filtered, instead of always opening on "all".
  const initialCategory = searchParams.get('category') ?? 'all'
  const [selectedCategory, setSelectedCategoryState] = useState<string>(initialCategory)

  function setSelectedCategory(slug: string) {
    setSelectedCategoryState(slug)
    // Keeps the URL in sync so the filter is shareable and survives a
    // refresh, without a full page navigation.
    const params = new URLSearchParams(searchParams.toString())
    if (slug === 'all') {
      params.delete('category')
    } else {
      params.set('category', slug)
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput), 250)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const filteredItems = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()

    return initialItems.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        (item.description?.toLowerCase().includes(query) ?? false)

      const matchesCategory =
        selectedCategory === 'all' || item.categories?.slug === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [initialItems, debouncedSearch, selectedCategory])

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            aria-label="Search the menu"
            placeholder="Search pastries, breads, cakes..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 pr-10 text-base text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-brand-pink-medium focus:ring-2 focus:ring-brand-pink-medium sm:text-sm"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`${pillClass} ${selectedCategory === 'all' ? pillActiveClass : pillIdleClass}`}
          >
            All
          </button>
          {categories.map((category) =>
            category.slug === 'custom-cakes' ? (
              // Custom cakes are priced by size and finish, not stored as
              // catalog rows, so this pill opens the configurator instead of
              // filtering down to an empty grid.
              <Link
                key={category.id}
                href="/custom-cakes"
                className={`${pillClass} ${pillIdleClass}`}
              >
                {category.name}
              </Link>
            ) : (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.slug)}
                className={`${pillClass} ${
                  selectedCategory === category.slug ? pillActiveClass : pillIdleClass
                }`}
              >
                {category.name}
              </button>
            )
          )}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No items found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

function MenuItemCard({ item }: { item: MenuItem }) {
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartUIStore((state) => state.open)

  // Stock below the minimum order cannot be sold, so it counts as sold out.
  const isOutOfStock = item.stock_count !== null && item.stock_count < item.min_quantity
  const hasMinimum = item.min_quantity > 1

  const addLabel = hasMinimum ? `Add ${item.min_quantity} to cart` : 'Add to cart'

  function handleAddToCart() {
    addItem({
      itemType: 'menu_item',
      menuItemId: item.id,
      itemName: item.name,
      imageUrl: item.image_url,
      unitPrice: item.price,
      minQuantity: item.min_quantity,
    })
    openCart()
  }

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div>
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.image_alt_text}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              role="img"
              aria-label={item.image_alt_text}
              className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground"
            >
              <Cake size={32} aria-hidden="true" />
              <span className="text-sm">Photo coming soon</span>
            </div>
          )}

          {item.dietary_tags.length > 0 && (
            <div className="absolute right-2 top-2 flex gap-1">
              {item.dietary_tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-surface/90 px-2 py-0.5 text-xs font-bold text-foreground shadow-sm backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-brand-espresso/50">
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-foreground">
                Sold out today
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {item.categories?.name}
          </span>
          <h3 className="mt-1 text-lg font-bold text-foreground">{item.name}</h3>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
          )}
          {hasMinimum && (
            <p className="mt-2 text-xs font-medium text-foreground">
              Minimum order {item.min_quantity}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/50 px-5 pb-5 pt-3">
        <span className="text-xl font-bold text-foreground">
          {formatNaira(item.price)}
          {hasMinimum && (
            <span className="ml-1 text-xs font-normal text-muted-foreground">each</span>
          )}
        </span>
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="min-h-10 rounded-lg bg-brand-green px-3 py-2 text-sm font-semibold text-brand-espresso shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isOutOfStock ? 'Sold out' : addLabel}
        </button>
      </div>
    </div>
  )
}