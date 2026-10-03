import { Skeleton } from '@/app/components/Skeleton'

export default function AdminLoading() {
  return (
    <main
      role="status"
      aria-label="Loading orders"
      className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8"
    >
      <Skeleton className="h-8 w-28" />
      <Skeleton className="mt-2 h-4 w-56 max-w-full" />
      <Skeleton className="mt-3 h-10 w-32 rounded-full" />

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 shrink-0 rounded-full" />
        ))}
      </div>

      <ul className="mt-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="space-y-3 rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </li>
        ))}
      </ul>
    </main>
  )
}