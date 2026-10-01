import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MenuItemEditForm } from '@/app/components/MenuItemEditForm'
import { MenuItemPhoto } from '@/app/components/MenuItemPhoto'
import { requireAdmin } from '@/lib/auth/require-admin'
import { menuItemIdSchema, type MenuItemDetailsInput } from '@/lib/validations/admin-menu'

export const metadata: Metadata = {
  title: 'Edit menu item',
  robots: { index: false, follow: false },
}

export default async function EditMenuItemPage({ params }: PageProps<'/admin/menu/[id]'>) {
  const { supabase } = await requireAdmin()
  const { id } = await params

  const parsedId = menuItemIdSchema.safeParse(id)
  if (!parsedId.success) {
    notFound()
  }

  const { data: item, error } = await supabase
    .from('menu_items')
    .select('id, name, description, price, min_quantity, image_alt_text, image_url')
    .eq('id', parsedId.data)
    .maybeSingle()

  if (error) {
    console.error('Error loading menu item for edit:', error.message)
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-6 sm:px-6 sm:py-8">
        <p className="text-center text-sm text-muted-foreground">
          We could not load this item. Please go back and try again.
        </p>
      </main>
    )
  }

  if (!item) {
    notFound()
  }

  const defaults: MenuItemDetailsInput = {
    name: item.name,
    description: item.description ?? '',
    priceNaira: String(Math.round(item.price / 100)),
    minQuantity: String(item.min_quantity),
    imageAltText: item.image_alt_text,
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-6 sm:px-6 sm:py-8">
      <Link href="/admin/menu" className="text-sm font-medium text-primary underline underline-offset-2">
        Back to manage stock
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-foreground">Edit {item.name}</h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        Changes show on the menu straight away. A new price applies to new orders only.
      </p>
      <div className="space-y-6 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
        <MenuItemPhoto menuItemId={item.id} imageUrl={item.image_url} altText={item.image_alt_text} />
        <MenuItemEditForm menuItemId={item.id} defaults={defaults} />
      </div>
    </main>
  )
}