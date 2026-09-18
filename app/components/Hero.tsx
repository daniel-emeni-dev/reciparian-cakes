'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background photo — zooms out from 1.15x to 1x once on load,
          not on every scroll, so it only costs animation work once. */}
      <motion.div
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        className="absolute inset-0"
      >
        <Image
          src="/hero-cake.jpg"
          alt="A freshly decorated Reciparian Cakes drip cake with pastel buttercream florals"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Gradient overlay for text legibility over the photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900/70 via-stone-900/50 to-stone-900/80" />

      <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Image
            src="/reciparian-white-outline-logo.png"
            alt="Reciparian Cakes logo"
            width={100}
            height={100}
            priority
            className="mx-auto"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl"
        >
          Handcrafted Cakes &amp; Pastries, Baked Fresh in Port Harcourt
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mx-auto mt-4 max-w-xl text-lg text-white/90"
        >
          From rich custom cakes to warm cinnamon rolls, every order is made from scratch,
          the day you order it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/menu"
            className="rounded-xl bg-brand-espresso px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-brand-espresso-light"
          >
            Shop Fresh Pastries
          </Link>
          <Link
            href="/menu"
            className="rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            View Delivery Menu
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <TrustIndicators />
        </motion.div>
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
    <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-white/90">
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
