'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth'
import { updatePassword } from '@/app/actions/auth'

export function ResetPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  async function onSubmit(values: ResetPasswordInput) {
    try {
      const result = await updatePassword(values)
      if (!result.success) {
        toast.error(result.error ?? 'Something went wrong.')
        return
      }
      toast.success('Password updated.')
      window.location.href = '/'
    } catch (error) {
      console.error('Password update failed:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
      <div>
        <label htmlFor="reset-password" className="text-sm font-medium text-foreground">
          New password
        </label>
        <input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm"
        />
        {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="reset-confirm-password" className="text-sm font-medium text-foreground">
          Confirm new password
        </label>
        <input
          id="reset-confirm-password"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-danger">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Save new password'}
      </button>
    </form>
  )
}
