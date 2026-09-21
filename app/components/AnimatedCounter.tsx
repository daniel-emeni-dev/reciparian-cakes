'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

/**
 * Counts up from 0 to `value` once scrolled into view, using
 * requestAnimationFrame — cheap, GPU-friendly, no layout thrash.
 * Built so it's ready to use the moment there's a real number to
 * show (review count, orders fulfilled, etc.) — deliberately not
 * called anywhere yet with a fabricated figure. See TestimonialsSection
 * for where this plugs in once real data exists.
 */
export function AnimatedCounter({
  value,
  suffix = '',
  duration = 1200,
}: {
  value: number
  suffix?: string
  duration?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return

    let start: number | null = null
    let frame: number

    function step(timestamp: number) {
      if (start === null) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setDisplay(Math.floor(progress * value))
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [isInView, value, duration])

  return (
    <motion.span ref={ref}>
      {display.toLocaleString('en-NG')}
      {suffix}
    </motion.span>
  )
}
