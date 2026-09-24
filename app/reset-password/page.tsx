import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ResetPasswordForm } from '@/app/components/ResetPasswordForm'

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/forgot-password?error=link_expired')
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Choose a new password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Use at least 8 characters. You will be logged in once it is saved.
      </p>

      <ResetPasswordForm />
    </div>
  )
}
