import { Skeleton } from '@/app/components/Skeleton'

export default function AdminMenuLoading() {
  return (
    <main
      role="status"
      aria-label="Loading stock"
      className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8"
    >
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-3 h-8 w-44" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />

      <div className="mt-6 space-y-8">
        {Array.from({ length: 2 }).map((_, group) => (
          <section key={group}>
            <Skeleton className="h-4 w-36" />
            <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
              {Array.from({ length: 4 }).map((_, row) => (
                <li key={row} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-7 w-12 rounded-full" />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}