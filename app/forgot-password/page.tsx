import Link from 'next/link'
import { ForgotPasswordForm } from '@/app/components/ForgotPasswordForm'

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { error } = await searchParams

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Forgot your password?</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your email and we will send you a link to choose a new one.
      </p>

      {error === 'link_expired' && (
        <p role="alert" className="mt-4 rounded-xl bg-muted p-4 text-sm text-foreground">
          That reset link is invalid or has expired. Request a new one below.
        </p>
      )}

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{' '}
        <Link href="/login" className="font-medium text-foreground underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
