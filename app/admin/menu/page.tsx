import type { Metadata } from 'next'
import Link from 'next/link'
import { AvailabilityToggle } from '@/app/components/AvailabilityToggle'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata: Metadata = {
  title: 'Manage stock',
  robots: { index: false, follow: false },
}

export default async function AdminMenuPage() {
  await requireAdmin()

  // Service role: the customer menu query hides sold out rows, and the admin
  // needs to see them to switch them back on.
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('menu_items')
    .select('id, name, is_available, categories ( name )')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error loading menu for admin:', error.message)
  }

  const items = data ?? []
  const groups = new Map<string, typeof items>()

  for (const item of items) {
    const category = item.categories?.name ?? 'Other'
    const group = groups.get(category) ?? []
    group.push(item)
    groups.set(category, group)
  }

  const sortedGroups = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
  const soldOutCount = items.filter((item) => !item.is_available).length

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <Link href="/admin" className="text-sm font-medium text-primary underline underline-offset-2">
          Back to orders
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">Manage stock</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Switch an item to Sold out and customers stop seeing it and cannot check out with it.
          {items.length > 0 && ` ${soldOutCount} sold out right now.`}
        </p>
      </header>

      {error ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          We could not load the menu. Please refresh the page.
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {sortedGroups.map(([category, categoryItems]) => (
            <section key={category} aria-labelledby={`stock-${category}`}>
              <h2 id={`stock-${category}`} className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {category}
              </h2>
              <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
                {categoryItems.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-4 p-4">
                    <span className="min-w-0 text-sm font-medium text-foreground">{item.name}</span>
                    <AvailabilityToggle
                      menuItemId={item.id}
                      itemName={item.name}
                      isAvailable={item.is_available}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}