'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Testimonial } from '@/app/actions/testimonials'

const AUTO_ADVANCE_MS = 5000

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

  return (
    <div className="relative mx-auto max-w-xl overflow-hidden rounded-2xl border border-stone-200 bg-white p-8 text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="mb-3 flex justify-center gap-1" aria-label={`${current.rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} filled={i < current.rating} />
            ))}
          </div>
          <p className="text-stone-700">&ldquo;{current.message}&rdquo;</p>
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
