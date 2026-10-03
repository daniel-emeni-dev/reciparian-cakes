'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import type { CurrentUser } from '@/lib/auth/get-current-user'
import { LogoutButton } from './LogoutButton'

const NAV_LINKS = [
  { href: '/menu', label: 'Menu' },
  { href: '/custom-cakes', label: 'Custom cakes' },
  { href: '/track', label: 'Track order' },
  { href: '/contact', label: 'Contact' },
] as const

const ACCOUNT_LINKS = [
  { href: '/profile', label: 'Profile' },
  { href: '/orders', label: 'My orders' },
  { href: '/wishlist', label: 'Wishlist' },
] as const

interface HeaderNavProps {
  user: CurrentUser | null
}

export function HeaderNav({ user }: HeaderNavProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const pathname = usePathname()
  const accountRef = useRef<HTMLDivElement>(null)

  // A route change means a link was followed, so both menus should close.
  useEffect(() => {
    setIsMobileOpen(false)
    setIsAccountOpen(false)
  }, [pathname])

  // Lock body scroll while the mobile panel is open, same as the cart drawer.
  useEffect(() => {
    if (!isMobileOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [isMobileOpen])

  useEffect(() => {
    if (!isMobileOpen && !isAccountOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setIsMobileOpen(false)
      setIsAccountOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMobileOpen, isAccountOpen])

  // Close the desktop dropdown on a click outside it.
  useEffect(() => {
    if (!isAccountOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isAccountOpen])

  return (
    <>
      <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
            {link.label}
          </Link>
        ))}
      </nav>

      <div ref={accountRef} className="relative hidden sm:block">
        <button
          type="button"
          onClick={() => setIsAccountOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={isAccountOpen}
          aria-label="Account"
          className="flex items-center gap-1.5 rounded-full p-2 text-foreground transition-colors hover:bg-muted"
        >
          <AccountIcon />
          {user?.fullName && <span className="text-sm font-medium">{firstName(user.fullName)}</span>}
        </button>

        <AnimatePresence>
          {isAccountOpen && (
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-40 mt-2 w-48 rounded-xl border border-border bg-surface p-2 shadow-lg"
            >
              {user ? (
                <>
                  <p className="truncate px-3 py-1.5 text-xs text-muted-foreground">{user.email}</p>
                  {ACCOUNT_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block rounded-lg px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <LogoutButton
                    onBeforeRedirect={() => setIsAccountOpen(false)}
                    className="w-full rounded-lg px-3 py-1.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  />
                </>
              ) : (
                <div className="flex flex-col">
                  <Link
                    href="/login"
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={() => setIsMobileOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isMobileOpen}
        aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
        className="rounded-full p-2 text-foreground transition-colors hover:bg-muted sm:hidden"
      >
        {isMobileOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            {createPortal(
              <motion.div
                key="mobile-menu-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-20 bg-foreground/20 sm:hidden"
                onClick={() => setIsMobileOpen(false)}
                aria-hidden="true"
              />,
              document.body
            )}
            <motion.div
              key="mobile-menu-panel"
              role="menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-x-0 top-full z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-border bg-background px-4 py-4 shadow-lg sm:hidden"
            >
              {user && (
                <div className="mb-4 rounded-xl bg-muted px-4 py-3">
                  <p className="truncate text-base font-semibold text-foreground">
                    {user.fullName ?? user.email}
                  </p>
                  {user.fullName && (
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  )}
                </div>
              )}

              <MobileSection label="Shop">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
              </MobileSection>

              {user && (
                <MobileSection label="Account">
                  {ACCOUNT_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {link.label}
                    </Link>
                  ))}
                </MobileSection>
              )}

              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                {user ? (
                  <LogoutButton
                    onBeforeRedirect={() => setIsMobileOpen(false)}
                    className="w-full rounded-xl border border-border px-4 py-3 text-center text-base font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  />
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="rounded-xl bg-primary px-4 py-3 text-center text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Create account
                    </Link>
                    <Link
                      href="/login"
                      className="rounded-xl border border-border px-4 py-3 text-center text-base font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      Log in
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

interface MobileSectionProps {
  label: string
  children: React.ReactNode
}

function MobileSection({ label, children }: MobileSectionProps) {
  return (
    <div className="mt-3 first:mt-0">
      <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <nav className="flex flex-col gap-0.5">{children}</nav>
    </div>
  )
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName
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

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}