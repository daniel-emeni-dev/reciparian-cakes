'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Wraps any section in a fade + slight rise animation that triggers
 * once when scrolled into view. Uses Framer Motion's whileInView,
 * which is backed by IntersectionObserver rather than a scroll event
 * listener — this is the performant way to do scroll animations,
 * since it doesn't run on every scroll tick.
 */
export function FadeInSection({
  children,
  delay = 0,
}: {
  children: ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
