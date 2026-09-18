import Image from 'next/image'
import Link from 'next/link'
import { FadeInSection } from './FadeInSection'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-cream via-brand-yellow to-stone-50 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <FadeInSection>
          <Image
            src="/reciparian-logo.png"
            alt="Reciparian Cakes logo"
            width={120}
            height={120}
            priority
            className="mx-auto"
          />
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <h1 className="mt-6 text-4xl font-bold leading-tight text-stone-900 sm:text-5xl">
            Handcrafted Cakes &amp; Pastries, Baked Fresh in Port Harcourt
          </h1>
        </FadeInSection>

        <FadeInSection delay={0.2}>
          <p className="mx-auto mt-4 max-w-xl text-lg text-stone-600">
            From rich custom cakes to warm cinnamon rolls, every order is made from scratch,
            the day you order it.
          </p>
        </FadeInSection>

        <FadeInSection delay={0.3}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/menu"
              className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-stone-800"
            >
              Shop Fresh Pastries
            </Link>
            <Link
              href="/menu"
              className="rounded-xl border border-stone-300 bg-white/70 px-6 py-3 text-sm font-semibold text-stone-800 backdrop-blur-sm transition-colors hover:bg-white"
            >
              View Delivery Menu
            </Link>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.4}>
          <TrustIndicators />
        </FadeInSection>
      </div>
    </section>
  )
}

function TrustIndicators() {
  const indicators = [
    { icon: <SparkleIcon />, label: 'Baked Fresh Daily' },
    { icon: <TruckIcon />, label: 'Delivery Across Rivers State' },
    { icon: <HandshakeIcon />, label: 'Pickup or Delivery, Your Choice' },
  ]

  return (
    <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-stone-600">
      {indicators.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {item.icon}
          {item.label}
        </span>
      ))}
    </div>
  )
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 7h11v9H3zM14 10h4l3 3v3h-7zM6.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HandshakeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 12l3 3 7-7M4 12l3-3 3 3-3 3-3-3zM12 8l2-2 6 6-2 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
