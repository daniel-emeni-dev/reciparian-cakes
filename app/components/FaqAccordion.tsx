'use client'

import { useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { Plus } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto mt-6 max-w-2xl space-y-3">
        {items.map((item, index) => {
          const isOpen = openIndex === index
          const panelId = `faq-panel-${index}`

          return (
            <div key={item.question} className="rounded-xl border border-border bg-surface">
              <h3>
                <button type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left text-sm font-semibold text-foreground"
                >
                  {item.question}
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-pink text-primary"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </motion.span>
                </button>
              </h3>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div id={panelId}
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-sm text-muted-foreground">{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </MotionConfig>
  )
}