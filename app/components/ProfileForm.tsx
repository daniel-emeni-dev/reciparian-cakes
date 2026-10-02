'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { updateProfile } from '@/app/actions/profile'
import { profileSchema, type ProfileInput } from '@/lib/validations/profile'

interface ProfileFormProps {
  initialFullName: string
  initialPhone: string
  email: string
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60'

export function ProfileForm({ initialFullName, initialPhone, email }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: initialFullName, phone: initialPhone },
  })

  async function onSubmit(values: ProfileInput) {
    const result = await updateProfile(values)
    if (!result.success) {
      toast.error(result.error ?? 'Could not save your details. Please try again.')
      return
    }
    toast.success('Your details have been saved.')
    reset(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <label htmlFor="fullName" className="text-sm font-medium text-foreground">
          Full name
        </label>
        <input id="fullName" type="text" autoComplete="name" className={inputClass} {...register('fullName')} />
        {errors.fullName && <p className="mt-1 text-xs text-danger">{errors.fullName.message}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="text-sm font-medium text-foreground">
          Phone number
        </label>
        <input id="phone" type="tel" autoComplete="tel" className={inputClass} {...register('phone')} />
        {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input id="email" type="email" value={email} disabled readOnly className={inputClass} />
        <p className="mt-1 text-xs text-muted-foreground">Your email cannot be changed here.</p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isDirty}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
      >
        {isSubmitting ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  )
}