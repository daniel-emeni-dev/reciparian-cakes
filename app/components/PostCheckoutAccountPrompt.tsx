'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { passwordSignupSchema, magicLinkSchema } from '@/lib/validations/auth'
import { signUpWithPassword, sendMagicLink } from '@/app/actions/auth'

interface Props {
  prefillEmail: string
  prefillName: string
}

/**
 * Renders only for guest orders (order.user_id === null) on the
 * checkout success screen. Pre-fills email/name from the order that
 * was just placed so signup is one tap.
 */
export function PostCheckoutAccountPrompt({ prefillEmail, prefillName }: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [linkSent, setLinkSent] = useState(false)

  const passwordForm = useForm({
    resolver: zodResolver(passwordSignupSchema),
    defaultValues: { fullName: prefillName, email: prefillEmail, password: '' },
  })

  async function createWithPassword(values: {
    fullName: string
    email: string
    password: string
  }) {
    const result = await signUpWithPassword(values)
    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.')
      return
    }
    toast.success(
      result.needsEmailConfirmation
        ? 'Check your email to confirm your account — this order is already linked.'
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
    <div className="mt-8 rounded-2xl bg-[#FFFEE0] p-6 ring-1 ring-black/5">
      <h3 className="text-lg font-semibold text-stone-900">Save this order to an account</h3>
      <p className="mt-1 text-sm text-stone-600">
        Create an account with <span className="font-medium">{prefillEmail}</span> and
        we&apos;ll attach this order automatically — plus you&apos;ll get order history,
        wishlist, and faster checkout next time.
      </p>

      {linkSent ? (
        <p className="mt-4 text-sm text-stone-700">
          Check your email for a magic link to finish setting up your account.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <form
            onSubmit={passwordForm.handleSubmit(createWithPassword)}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input
              type="password"
              placeholder="Choose a password"
              {...passwordForm.register('password')}
              className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={passwordForm.formState.isSubmitting}
              className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
            >
              Create account
            </button>
          </form>

          <button
            type="button"
            onClick={sendLink}
            className="text-sm font-medium text-stone-700 underline"
          >
            Or send me a magic link instead
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="mt-4 text-xs text-stone-500 underline"
      >
        No thanks
      </button>
    </div>
  )
}
