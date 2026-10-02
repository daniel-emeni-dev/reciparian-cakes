import Link from 'next/link'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { FadeInSection } from '@/app/components/FadeInSection'
import { SocialLinks } from '@/app/components/SocialLinks'
import { BAKERY } from '@/lib/bakery'

const SHOP_LINKS = [
  { href: '/menu', label: 'Menu' },
  { href: '/custom-cakes', label: 'Custom cakes' },
  { href: '/track', label: 'Track order' },
  { href: '/contact', label: 'Contact' },
] as const

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy policy' },
  { href: '/refund-policy', label: 'Refund policy' },
] as const

const linkClass = 'text-sm text-muted-foreground transition-colors hover:text-primary'

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-brand-pink">
      <FadeInSection>
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <p className="text-lg font-bold text-primary">{BAKERY.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Fresh cakes, bakes and sweets, made in Port Harcourt.
              </p>
            </div>

            <nav aria-label="Shop">
              <h2 className="text-sm font-semibold text-foreground">Shop</h2>
              <ul className="mt-3 space-y-2">
                {SHOP_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="text-sm font-semibold text-foreground">Visit and call</h2>
              <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{BAKERY.pickupAddress}</span>
                </li>
                <li className="flex gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{BAKERY.openingHours}</span>
                </li>
                <li className="flex gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <a href={BAKERY.phoneHref} className="transition-colors hover:text-primary">
                    {BAKERY.phoneDisplay}
                  </a>
                </li>
                <li className="flex gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <a
                    href={`mailto:${BAKERY.email}`}
                    className="break-all transition-colors hover:text-primary"
                  >
                    {BAKERY.email}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-foreground">Follow us</h2>
              <div className="mt-3 [&_ul]:justify-start">
                <SocialLinks />
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              &copy; {year} {BAKERY.name}. All rights reserved.
            </p>
            <nav aria-label="Legal">
              <ul className="flex gap-4">
                {LEGAL_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-xs text-muted-foreground transition-colors hover:text-primary">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </FadeInSection>
    </footer>
  )
}