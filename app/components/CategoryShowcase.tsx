import Link from 'next/link'
import { FadeInSection } from './FadeInSection'

interface Category {
  id: string
  name: string
  slug: string
}

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeInSection>
          <h2 className="text-center text-3xl font-bold text-stone-900">Shop by Category</h2>
        </FadeInSection>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {categories.map((category, i) => (
            <FadeInSection key={category.id} delay={i * 0.1}>
              <Link
                href={`/menu?category=${category.slug}`}
                className="group flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-pink transition-colors group-hover:bg-brand-pink-medium">
                  <CakeIcon />
                </div>
                <h3 className="mt-4 text-lg font-bold text-stone-900">{category.name}</h3>
                <span className="mt-1 text-sm text-stone-500 underline-offset-4 group-hover:underline">
                  Browse menu
                </span>
              </Link>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  )
}

function CakeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 21v-7a3 3 0 013-3h10a3 3 0 013 3v7H4zM4 21h16M9 11V7a3 3 0 016 0v4M12 4v1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
