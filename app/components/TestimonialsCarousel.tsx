'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import type { Testimonial } from '@/app/actions/testimonials'

const AUTO_ADVANCE_MS = 5000
const SWIPE_THRESHOLD = 50

export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (testimonials.length <= 1) return
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(interval)
  }, [testimonials.length])

  if (testimonials.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
        <p className="text-stone-600">
          We&apos;re just getting started collecting reviews — check back soon, or be the first
          to share yours after your order!
        </p>
      </div>
    )
  }

  const current = testimonials[index]

  function goNext() {
    setIndex((i) => (i + 1) % testimonials.length)
  }

  function goPrev() {
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) goNext()
    else if (info.offset.x > SWIPE_THRESHOLD) goPrev()
  }

  return (
    <div className="relative mx-auto max-w-xl overflow-hidden rounded-2xl border border-stone-200 bg-white p-8 text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="cursor-grab active:cursor-grabbing"
        >
          <Avatar name={current.customer_name} avatarUrl={current.avatar_url} />

          <div className="mt-3 flex justify-center gap-1" aria-label={`${current.rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} filled={i < current.rating} />
            ))}
          </div>
          <p className="mt-3 text-stone-700">&ldquo;{current.message}&rdquo;</p>
          <p className="mt-4 text-sm font-semibold text-stone-900">{current.customer_name}</p>
        </motion.div>
      </AnimatePresence>

      {testimonials.length > 1 && (
        <div className="mt-6 flex justify-center gap-1.5">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show testimonial ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-brand-pink-medium' : 'w-1.5 bg-stone-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="relative mx-auto h-14 w-14 overflow-hidden rounded-full bg-brand-pink">
      {avatarUrl ? (
        <Image src={avatarUrl} alt="" fill sizes="56px" className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-stone-700">
          {initials}
        </div>
      )}
    </div>
  )
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      className={filled ? 'text-amber-500' : 'text-stone-300'}
      aria-hidden="true"
    >
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
