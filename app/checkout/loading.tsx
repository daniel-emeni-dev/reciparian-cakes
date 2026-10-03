import { Skeleton } from '@/app/components/Skeleton'

export default function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div role="status" aria-label="Loading checkout" className="mx-auto max-w-2xl">
        <Skeleton className="mb-6 h-9 w-24 rounded-full" />
        <Skeleton className="mb-8 h-9 w-44" />

        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-border bg-surface p-6">
            <Skeleton className="h-5 w-36" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-surface p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-4 h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  )
}