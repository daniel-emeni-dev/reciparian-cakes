'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { updateMenuItemDetails } from '@/app/actions/admin-menu-edit'
import { menuItemDetailsSchema, type MenuItemDetailsInput } from '@/lib/validations/admin-menu'

const inputClass =
  'mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm'

interface MenuItemEditFormProps {
  menuItemId: string
  defaults: MenuItemDetailsInput
}

export function MenuItemEditForm({ menuItemId, defaults }: MenuItemEditFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<MenuItemDetailsInput>({
    resolver: zodResolver(menuItemDetailsSchema),
    defaultValues: defaults,
  })

  async function onSubmit(values: MenuItemDetailsInput) {
    try {
      const result = await updateMenuItemDetails({ menuItemId, ...values })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Item saved.')
      reset(values)
    } catch (error) {
      console.error('Menu item save failed:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="item-name" className="text-sm font-medium text-foreground">
          Name
        </label>
        <input id="item-name" type="text" {...register('name')} className={inputClass} />
        {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="item-description" className="text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="item-description"
          rows={4}
          {...register('description')}
          className={inputClass}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-danger">{errors.description.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="item-price" className="text-sm font-medium text-foreground">
            Price
          </label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-sm text-muted-foreground"
            >
              ₦
            </span>
            <input
              id="item-price"
              type="text"
              inputMode="numeric"
              {...register('priceNaira')}
              className={`${inputClass} pl-8`}
            />
          </div>
          {errors.priceNaira && (
            <p className="mt-1 text-xs text-danger">{errors.priceNaira.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="item-min" className="text-sm font-medium text-foreground">
            Minimum order
          </label>
          <input
            id="item-min"
            type="text"
            inputMode="numeric"
            {...register('minQuantity')}
            className={inputClass}
          />
          {errors.minQuantity && (
            <p className="mt-1 text-xs text-danger">{errors.minQuantity.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="item-alt" className="text-sm font-medium text-foreground">
          Photo description
        </label>
        <input id="item-alt" type="text" {...register('imageAltText')} className={inputClass} />
        <p className="mt-1 text-xs text-muted-foreground">
          A short line describing the photo, read aloud for people who cannot see it.
        </p>
        {errors.imageAltText && (
          <p className="mt-1 text-xs text-danger">{errors.imageAltText.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isDirty}
        className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  )
}