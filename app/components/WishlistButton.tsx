'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import clsx from 'clsx'
import { addToWishlist, removeFromWishlist } from '@/app/actions/wishlist'

interface WishlistButtonProps {
  menuItemId: string
  itemName: string
  initialSaved: boolean
  isSignedIn: boolean
}

export function WishlistButton({ menuItemId, itemName, initialSaved, isSignedIn }: WishlistButtonProps) {
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!isSignedIn) {
      toast('Log in to save favorites', {
        action: { label: 'Log in', onClick: () => router.push('/login') },
      })
      return
    }

    const next = !saved
    setSaved(next)

    startTransition(async () => {
      const result = next ? await addToWishlist(menuItemId) : await removeFromWishlist(menuItemId)
      if (!result.success) {
        setSaved(!next)
        toast.error(result.error ?? 'Could not update your wishlist. Please try again.')
        return
      }
      toast.success(next ? 'Saved to your wishlist' : 'Removed from your wishlist')
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${itemName} from wishlist` : `Save ${itemName} to wishlist`}
      className="absolute left-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-surface disabled:opacity-60"
    >
      <Heart
        size={20}
        aria-hidden="true"
        className={clsx(saved ? 'fill-current text-brand-pink-deep' : 'text-muted-foreground')}
      />
    </button>
  )
}