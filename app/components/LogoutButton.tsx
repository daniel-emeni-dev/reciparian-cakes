'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCartStore } from '@/lib/store/cart'
import { signOut } from '@/app/actions/auth'

interface LogoutButtonProps {
  className?: string
  /** Called right before the redirect, so a caller can close its own menu or panel. */
  onBeforeRedirect?: () => void
}

const DEFAULT_CLASSES =
  'text-sm font-medium text-foreground transition-colors hover:text-primary disabled:opacity-50'

export function LogoutButton({ className, onBeforeRedirect }: LogoutButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const clearCart = useCartStore((state) => state.clearCart)

  async function handleLogout() {
    setIsLoading(true)
    try {
      await signOut()
      clearCart()
      onBeforeRedirect?.()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Could not log out. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={className ?? DEFAULT_CLASSES}
    >
      {isLoading ? 'Logging out...' : 'Log out'}
    </button>
  )
}
