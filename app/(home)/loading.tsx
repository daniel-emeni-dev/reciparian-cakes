import { Skeleton } from '@/app/components/Skeleton'

export default function HomeLoading() {
  return (
    <main role="status" aria-label="Loading">
      <Skeleton className="h-[26rem] w-full rounded-none sm:h-[32rem]" />

      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Skeleton className="mx-auto h-8 w-56" />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-2xl border border-border bg-surface p-10"
              >
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="mt-4 h-5 w-32" />
                <Skeleton className="mt-2 h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-surface p-8">
          <Skeleton className="mx-auto h-14 w-14 rounded-full" />
          <Skeleton className="mx-auto mt-4 h-4 w-28" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </div>
      </div>
    </main>
  )
}