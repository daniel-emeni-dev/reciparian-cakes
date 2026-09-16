'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  passwordLoginSchema,
  magicLinkSchema,
  type PasswordLoginInput,
  type MagicLinkInput,
} from '@/lib/validations/auth'
import { signInWithPassword, sendMagicLink } from '@/app/actions/auth'

type Tab = 'password' | 'magic-link'

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('password')
  const [linkSent, setLinkSent] = useState(false)

  const passwordForm = useForm<PasswordLoginInput>({
    resolver: zodResolver(passwordLoginSchema),
  })

  const magicLinkForm = useForm<MagicLinkInput>({
    resolver: zodResolver(magicLinkSchema),
  })

  async function onPasswordSubmit(values: PasswordLoginInput) {
    const result = await signInWithPassword(values)
    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.')
      return
    }
    toast.success('Welcome back!')
    window.location.href = '/'
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
      <h1 className="text-2xl font-semibold text-stone-900">Log in</h1>
      <p className="mt-1 text-sm text-stone-600">Welcome back to Reciparian Cakes.</p>

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
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="mt-6 space-y-4">
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
            {passwordForm.formState.isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      )}

      {tab === 'magic-link' &&
        (linkSent ? (
          <p className="mt-6 rounded-xl bg-stone-50 p-4 text-sm text-stone-700">
            Check your email for a link to log in.
          </p>
        ) : (
          <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)} className="mt-6 space-y-4">
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
        Don&apos;t have an account?{' '}
        <a href="/signup" className="font-medium text-stone-900 underline">
          Sign up
        </a>
      </p>
    </div>
  )
}
