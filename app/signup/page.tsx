'use client'

import { useState } from 'react'
import Link from 'next/link'
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

const LABEL_CLASSES = 'text-sm font-medium text-foreground'
const INPUT_CLASSES =
  'mt-1 w-full rounded-lg border border-muted-foreground/30 bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
const ERROR_CLASSES = 'mt-1 text-xs text-danger'
const PRIMARY_BUTTON_CLASSES =
  'w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50'

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
      <h1 className="text-2xl font-semibold text-foreground">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Save your addresses, track orders, and check out faster next time.
      </p>

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
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="mt-6 space-y-4"
        >
          <div>
            <label className={LABEL_CLASSES}>Full name</label>
            <input
              {...passwordForm.register('fullName')}
              className={INPUT_CLASSES}
            />
            {passwordForm.formState.errors.fullName && (
              <p className={ERROR_CLASSES}>
                {passwordForm.formState.errors.fullName.message}
              </p>
            )}
          </div>

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

          <div>
            <label className={LABEL_CLASSES}>Confirm password</label>
            <input type="password"
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
            className={PRIMARY_BUTTON_CLASSES}
          >
            {passwordForm.formState.isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      )}

      {tab === 'magic-link' &&
        (linkSent ? (
          <p className="mt-6 rounded-xl bg-muted p-4 text-sm text-foreground">
            Check your email for a link to finish signing up.
          </p>
        ) : (
          <form
            onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)}
            className="mt-6 space-y-4"
          >
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
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-foreground underline">
          Log in
        </Link>
      </p>
    </div>
  )
}