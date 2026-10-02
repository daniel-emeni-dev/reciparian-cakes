import type { ReactNode } from 'react'
import { FadeInSection } from '@/app/components/FadeInSection'

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: ReactNode
}) {
  return (
    <main className="bg-background">
      <FadeInSection>
        <section className="bg-brand-pink px-4 py-12 text-center sm:py-16">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold text-primary sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">Last updated {updated}</p>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <div className="mx-auto max-w-2xl space-y-8 px-4 py-12 text-sm leading-relaxed text-foreground">
          {children}
        </div>
      </FadeInSection>
    </main>
  )
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-primary">{heading}</h2>
      <div className="mt-2 space-y-3 text-muted-foreground">{children}</div>
    </section>
  )
}