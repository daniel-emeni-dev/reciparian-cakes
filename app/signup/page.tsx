'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  passwordSignupSchema,
  magicLinkSchema,
  type PasswordSignupInput,
  type MagicLinkInput,
} from '@/lib/validations/auth'
import { signUpWithPassword, sendMagicLink } from '@/app/actions/auth'

type Tab = 'password' | 'magic-link'

export default function SignupPage() {
  const [tab, setTab] = useState<Tab>('password')
  const [linkSent, setLinkSent] = useState(false)

  const passwordForm = useForm<PasswordSignupInput>({
    resolver: zodResolver(passwordSignupSchema),
  })

  const magicLinkForm = useForm<MagicLinkInput>({
    resolver: zodResolver(magicLinkSchema),
  })

  async function onPasswordSubmit(values: PasswordSignupInput) {
    const result = await signUpWithPassword(values)
    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.')
      return
    }
    if (result.needsEmailConfirmation) {
      toast.success('Check your email to confirm your account.')
    } else {
      toast.success('Account created!')
      window.location.href = '/'
    }
  }

  async function onMagicLinkSubmit(values: MagicLinkInput) {
    const result = await sendMagicLink(values)
    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.')
      return
    }
    setLinkSent(true)
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold text-stone-900">Create your account</h1>
      <p className="mt-1 text-sm text-stone-600">
        Save your addresses, track orders, and check out faster next time.
      </p>

      <div className="mt-6 flex gap-2 rounded-xl bg-stone-100 p-1">
        <button
          type="button"
          onClick={() => setTab('password')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === 'password' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setTab('magic-link')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === 'magic-link' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'
          }`}
        >
          Magic Link
        </button>
      </div>

      {tab === 'password' && (
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="text-sm font-medium text-stone-700">Full name</label>
            <input
              {...passwordForm.register('fullName')}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {passwordForm.formState.errors.fullName && (
              <p className="mt-1 text-xs text-red-600">
                {passwordForm.formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700">Email</label>
            <input
              type="email"
              {...passwordForm.register('email')}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {passwordForm.formState.errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {passwordForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700">Password</label>
            <input
              type="password"
              {...passwordForm.register('password')}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {passwordForm.formState.errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {passwordForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={passwordForm.formState.isSubmitting}
            className="w-full rounded-xl bg-stone-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
          >
            {passwordForm.formState.isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      )}

      {tab === 'magic-link' &&
        (linkSent ? (
          <p className="mt-6 rounded-xl bg-stone-50 p-4 text-sm text-stone-700">
            Check your email for a link to finish signing up.
          </p>
        ) : (
          <form
            onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)}
            className="mt-6 space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-stone-700">Email</label>
              <input
                type="email"
                {...magicLinkForm.register('email')}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {magicLinkForm.formState.errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {magicLinkForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={magicLinkForm.formState.isSubmitting}
              className="w-full rounded-xl bg-stone-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
            >
              {magicLinkForm.formState.isSubmitting ? 'Sending...' : 'Send magic link'}
            </button>
          </form>
        ))}

      <p className="mt-6 text-center text-sm text-stone-600">
        Already have an account?{' '}
        <a href="/login" className="font-medium text-stone-900 underline">
          Log in
        </a>
      </p>
    </div>
  )
}
