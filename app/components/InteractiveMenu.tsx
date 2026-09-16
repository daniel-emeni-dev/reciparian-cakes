'use client'

import { useEffect, useMemo, useState } from 'react'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number // kobo
  image_url: string | null
  image_alt_text: string
  dietary_tags: string[]
  stock_count: number | null
  categories: { name: string; slug: string } | null
}

interface Category {
  id: string
  name: string
  slug: string
}

function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString('en-NG')}`
}

export function InteractiveMenu({
  initialItems,
  categories,
}: {
  initialItems: MenuItem[]
  categories: Category[]
}) {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

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
      {/* Control panel */}
      <div className="mb-8 flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search pastries, breads, cakes..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 pr-9 text-sm outline-none transition-shadow focus:border-brand-pink-medium focus:ring-2 focus:ring-brand-pink-medium"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              selectedCategory === 'all'
                ? 'bg-brand-pink-medium text-stone-900'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.slug)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                selectedCategory === category.slug
                  ? 'bg-brand-pink-medium text-stone-900'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-12 text-center text-stone-500">
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
  const isOutOfStock = item.stock_count !== null && item.stock_count <= 0

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div>
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.image_alt_text}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              role="img"
              aria-label={item.image_alt_text}
              className="flex h-full w-full flex-col items-center justify-center gap-2 bg-brand-cream text-stone-400"
            >
              <CupcakeIcon />
              <span className="text-sm">Photo coming soon</span>
            </div>
          )}

          {item.dietary_tags.length > 0 && (
            <div className="absolute right-2 top-2 flex gap-1">
              {item.dietary_tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-white/90 px-2 py-0.5 text-xs font-bold text-stone-800 shadow-sm backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-900">
                Sold out today
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            {item.categories?.name}
          </span>
          <h3 className="mt-1 text-lg font-bold text-stone-900">{item.name}</h3>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm text-stone-600">{item.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50/50 px-5 pb-5 pt-2">
        <span className="text-xl font-bold text-stone-900">{formatNaira(item.price)}</span>
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={() => {
            alert(`Cart isn't wired up yet — coming in the next step.`)
          }}
          className="rounded-lg bg-brand-green px-3 py-1.5 text-sm font-semibold text-stone-900 shadow-sm transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isOutOfStock ? 'Sold out' : 'Add to Cart +'}
        </button>
      </div>
    </div>
  )
}

function CupcakeIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2c-1.1 0-2 .9-2 2 0 .3.1.6.2.8C8.3 5.4 7 6.8 7 8.5V9H5.5C4.7 9 4 9.7 4 10.5c0 .3.1.6.3.9L6.5 20h11l2.2-8.6c.1-.3.3-.6.3-.9 0-.8-.7-1.5-1.5-1.5H17v-.5c0-1.7-1.3-3.1-3.2-3.7.1-.2.2-.5.2-.8 0-1.1-.9-2-2-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
