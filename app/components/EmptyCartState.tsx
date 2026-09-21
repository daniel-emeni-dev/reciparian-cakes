import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

interface EmptyCartStateProps {
  onNavigate?: () => void
}

export function EmptyCartState({ onNavigate }: EmptyCartStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-pink text-brand-espresso">
        <ShoppingBag size={28} aria-hidden="true" />
      </div>
      <p className="mt-5 text-lg font-bold text-foreground">Your cart is feeling empty</p>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Fresh cakes, pastries and treats are waiting for you. Pick something sweet to get started.
      </p>
      <Link
        href="/menu"
        onClick={onNavigate}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-green px-6 py-3 text-sm font-semibold text-brand-espresso shadow-sm transition hover:brightness-95"
      >
        Browse the menu
      </Link>
      <Link
        href="/custom-cakes"
        onClick={onNavigate}
        className="mt-3 text-sm font-medium text-primary underline underline-offset-2"
      >
        or design a custom cake
      </Link>
    </div>
  )
}