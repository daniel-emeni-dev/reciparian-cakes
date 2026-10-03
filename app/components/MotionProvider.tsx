'use client'

import { MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'

// "user" follows the device's reduce motion setting. Framer then drops
// transform animations (the rise, slide and zoom) and keeps opacity fades.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}