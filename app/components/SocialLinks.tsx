import { BAKERY } from '@/lib/bakery'

type SocialKey = (typeof BAKERY.socials)[number]['key']

function SocialIcon({ name }: { name: SocialKey }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      {name === 'instagram' && (
        <>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </>
      )}
      {name === 'facebook' && (
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      )}
      {name === 'tiktok' && <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />}
    </svg>
  )
}

export function SocialLinks() {
  return (
    <ul className="flex flex-wrap justify-center gap-3">
      {BAKERY.socials.map((social) => (
        <li key={social.key}>
          <a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow ${BAKERY.name} on ${social.label}`}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-brand-pink"
          >
            <SocialIcon name={social.key} />
            {social.label}
          </a>
        </li>
      ))}
    </ul>
  )
}