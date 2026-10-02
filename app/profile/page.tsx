import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FadeInSection } from '@/app/components/FadeInSection'
import { LogoutButton } from '@/app/components/LogoutButton'
import { ProfileForm } from '@/app/components/ProfileForm'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getProfile } from '@/lib/profile/get-profile' 

export const metadata: Metadata = {
  title: 'My profile',
  robots: { index: false },
}

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)

  return (
    <main className="bg-background">
      <FadeInSection>
        <section className="bg-brand-pink px-4 py-12 text-center sm:py-16">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold text-primary sm:text-4xl">My profile</h1>
            <p className="mt-3 text-sm text-muted-foreground">Keep your details up to date.</p>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:py-14">
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground">Your details</h2>
            <div className="mt-5">
              {profile === null ? (
                <p className="text-sm text-muted-foreground">
                  We could not load your details right now. Please refresh in a moment.
                </p>
              ) : (
                <ProfileForm
                  initialFullName={profile.fullName}
                  initialPhone={profile.phone ?? ''}
                  email={user.email}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <Link href="/orders" className="text-sm font-medium text-primary underline underline-offset-2">
              View my orders
            </Link>
            <LogoutButton className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background disabled:opacity-50" />
          </div>
        </div>
      </FadeInSection>
    </main>
  )
}