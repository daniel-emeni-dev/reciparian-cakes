import { Skeleton } from '@/app/components/Skeleton'

export default function CustomCakesLoading() {
  return (
    <main className="px-4 py-12 sm:px-6 lg:px-8">
      <div
        role="status"
        aria-label="Loading cake builder"
        className="mx-auto w-full max-w-md rounded-3xl border border-border bg-surface p-6 sm:p-8"
      >
        <Skeleton className="h-7 w-44" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />

        <div className="mt-6 flex gap-2">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 flex-1 rounded-xl" />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-14 rounded-full" />
          ))}
        </div>

        <Skeleton className="mt-5 h-11 w-full rounded-xl" />

        <div className="mt-7 flex items-end justify-between border-t border-border pt-5">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-11 w-28 rounded-xl" />
        </div>
      </div>
    </main>
  )
}