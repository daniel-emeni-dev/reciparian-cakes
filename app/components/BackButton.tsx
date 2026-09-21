'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  fallbackHref: string
  label?: string
}

export function BackButton({ fallbackHref, label = 'Go back' }: BackButtonProps) {
  const router = useRouter()

  function handleClick() {
    // A visitor who opened this page from a shared link has no earlier page in
    // this tab, so going back would do nothing. The fallback keeps the button useful.
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(fallbackHref)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-pink text-brand-espresso transition-colors hover:bg-brand-pink-medium"
    >
      <ArrowLeft size={18} aria-hidden="true" />
    </button>
  )
}