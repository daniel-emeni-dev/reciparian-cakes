'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  passwordSignupSchema,
  magicLinkSchema,
  type PasswordSignupInput,
} from '@/lib/validations/auth'
import { signUpWithPassword, sendMagicLink } from '@/app/actions/auth'

interface Props {
  prefillEmail: string
  prefillName: string
}

const INPUT_CLASSES =
  'w-full rounded-lg border border-muted-foreground/30 bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
const ERROR_CLASSES = 'mt-1 text-xs text-danger'

/**
 * Renders only for guest orders (order.user_id === null) on the
 * checkout success screen. Pre-fills email and name from the order that
 * was just placed so signup is one tap.
 */
export function PostCheckoutAccountPrompt({ prefillEmail, prefillName }: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [linkSent, setLinkSent] = useState(false)

  const passwordForm = useForm<PasswordSignupInput>({
    resolver: zodResolver(passwordSignupSchema),
    defaultValues: {
      fullName: prefillName,
      email: prefillEmail,
      password: '',
      confirmPassword: '',
    },
  })

  async function createWithPassword(values: PasswordSignupInput) {
    const result = await signUpWithPassword(values)
    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.')
      return
    }
    toast.success(
      result.needsEmailConfirmation
        ? 'Check your email to confirm your account. This order is already linked.'
        : 'Account created! This order is saved to your account.'
    )
    setDismissed(true)
  }

  async function sendLink() {
    const parsed = magicLinkSchema.safeParse({ email: prefillEmail })
    if (!parsed.success) return

    const result = await sendMagicLink(parsed.data)
    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.')
      return
    }
    setLinkSent(true)
  }

  if (dismissed) return null

  return (
    <div className="mt-8 rounded-2xl bg-muted p-6 ring-1 ring-border">
      <h3 className="text-lg font-semibold text-foreground">Save this order to an account</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Create an account with <span className="font-medium">{prefillEmail}</span> and
        we&apos;ll attach this order automatically, plus you&apos;ll get order history,
        wishlist, and faster checkout next time.
      </p>

      {linkSent ? (
        <p className="mt-4 text-sm text-foreground">
          Check your email for a magic link to finish setting up your account.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <form
            onSubmit={passwordForm.handleSubmit(createWithPassword)}
            className="flex flex-col gap-2"
          >
            <div>
              <input type="password"
                placeholder="Choose a password"
                autoComplete="new-password"
                {...passwordForm.register('password')}
                className={INPUT_CLASSES}
              />
              {passwordForm.formState.errors.password && (
                <p className={ERROR_CLASSES}>
                  {passwordForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <input type="password"
                placeholder="Confirm your password"
                autoComplete="new-password"
                {...passwordForm.register('confirmPassword')}
                className={INPUT_CLASSES}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className={ERROR_CLASSES}>
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={passwordForm.formState.isSubmitting}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:self-start"
            >
              Create account
            </button>
          </form>

          <button
            type="button"
            onClick={sendLink}
            className="text-sm font-medium text-foreground underline"
          >
            Or send me a magic link instead
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="mt-4 text-xs text-muted-foreground underline"
      >
        No thanks
      </button>
    </div>
  )
}