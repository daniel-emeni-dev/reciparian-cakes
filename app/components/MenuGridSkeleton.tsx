import { Skeleton } from '@/app/components/Skeleton'

export function MenuGridSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading menu"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-2 p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}