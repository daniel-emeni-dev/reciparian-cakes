'use client'

import Link from 'next/link'
import { Pacifico } from 'next/font/google'
import { CartButton } from './CartButton'
import { CartDrawer } from './CartDrawer'

const pacifico = Pacifico({ subsets: ['latin'], weight: '400' })

export function SiteHeader() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-stone-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className={`${pacifico.className} text-2xl text-stone-900`}>
            Reciparian Cakes
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 sm:flex">
            <Link href="/menu" className="transition-colors hover:text-stone-900">
              Menu
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <Link
              href="/login"
              aria-label="Account"
              className="rounded-full p-2 text-stone-700 transition-colors hover:bg-stone-100"
            >
              <AccountIcon />
            </Link>
            <CartButton />
          </div>
        </div>
      </header>

      {/* Rendered once here so it's available on every page, right
          next to the header it's conceptually tied to. */}
      <CartDrawer />
    </>
  )
}

function AccountIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.6-7 8-7s8 3 8 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
