'use client'

import { useState } from 'react'
import Link from 'next/link'
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

const LABEL_CLASSES = 'text-sm font-medium text-foreground'
const INPUT_CLASSES =
  'mt-1 w-full rounded-lg border border-muted-foreground/30 bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
const ERROR_CLASSES = 'mt-1 text-xs text-danger'
const PRIMARY_BUTTON_CLASSES =
  'w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50'

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
      <h1 className="text-2xl font-semibold text-foreground">Log in</h1>
      <p className="mt-1 text-sm text-muted-foreground">Welcome back to Reciparian Cakes.</p>

      <div className="mt-6 flex gap-2 rounded-xl bg-muted p-1">
        <button
          type="button"
          onClick={() => setTab('password')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${tab === 'password' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setTab('magic-link')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${tab === 'magic-link' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
        >
          Magic Link
        </button>
      </div>

      {tab === 'password' && (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="mt-6 space-y-4">
          <div>
            <label className={LABEL_CLASSES}>Email</label>
            <input type="email"
              {...passwordForm.register('email')}
              className={INPUT_CLASSES}
            />
            {passwordForm.formState.errors.email && (
              <p className={ERROR_CLASSES}>
                {passwordForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className={LABEL_CLASSES}>Password</label>
            <input type="password"
              {...passwordForm.register('password')}
              className={INPUT_CLASSES}
            />
            {passwordForm.formState.errors.password && (
              <p className={ERROR_CLASSES}>
                {passwordForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="text-right">
            <Link href="/forgot-password" className="text-xs text-muted-foreground underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={passwordForm.formState.isSubmitting}
            className={PRIMARY_BUTTON_CLASSES}
          >
            {passwordForm.formState.isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      )}

      {tab === 'magic-link' &&
        (linkSent ? (
          <p className="mt-6 rounded-xl bg-muted p-4 text-sm text-foreground">
            Check your email for a link to log in.
          </p>
        ) : (
          <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)} className="mt-6 space-y-4">
            <div>
              <label className={LABEL_CLASSES}>Email</label>
              <input type="email"
                {...magicLinkForm.register('email')}
                className={INPUT_CLASSES}
              />
              {magicLinkForm.formState.errors.email && (
                <p className={ERROR_CLASSES}>
                  {magicLinkForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={magicLinkForm.formState.isSubmitting}
              className={PRIMARY_BUTTON_CLASSES}
            >
              {magicLinkForm.formState.isSubmitting ? 'Sending...' : 'Send magic link'}
            </button>
          </form>
        ))}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-foreground underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}