import Image from 'next/image'
import Link from 'next/link'
import { CartButton } from './CartButton'
import { CartDrawer } from './CartDrawer'
import { HeaderNav } from './HeaderNav'
import { getCurrentUser } from '@/lib/auth/get-current-user'

export async function SiteHeader() {
  const user = await getCurrentUser()

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex flex-shrink-0 items-center gap-2"
            aria-label="Reciparian Cakes home"
          >
            <Image src="/reciparian-logo.png" alt="Reciparian Cakes" width={36} height={36} priority />
            <span className="hidden text-lg font-semibold text-foreground sm:inline">
              Reciparian Cakes
            </span>
          </Link>

                    <div className="flex flex-shrink-0 items-center gap-1 sm:gap-4">
            <HeaderNav user={user} />
            <CartButton />
          </div>
        </div>
      </header>

      <CartDrawer />
    </>
  )
}
