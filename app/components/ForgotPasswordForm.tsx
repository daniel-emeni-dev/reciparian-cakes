'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth'
import { requestPasswordReset } from '@/app/actions/auth'

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(values: ForgotPasswordInput) {
    try {
      const result = await requestPasswordReset(values)
      if (!result.success) {
        toast.error(result.error ?? 'Something went wrong.')
        return
      }
      setSentTo(values.email)
    } catch (error) {
      console.error('Password reset request failed:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  if (sentTo) {
    return (
      <p role="status" className="mt-6 rounded-xl bg-muted p-4 text-sm text-foreground">
        If there is an account for {sentTo}, we have sent a link to reset your password. It can
        take a minute to arrive, so check your spam folder too.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
      <div>
        <label htmlFor="forgot-email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm"
        />
        {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? 'Sending...' : 'Send reset link'}
      </button>
    </form>
  )
}
