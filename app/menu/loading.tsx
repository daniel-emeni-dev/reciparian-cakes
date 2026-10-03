import { Skeleton } from '@/app/components/Skeleton'
import { MenuGridSkeleton } from '@/app/components/MenuGridSkeleton'

export default function MenuLoading() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col items-center gap-3">
          <Skeleton className="h-12 w-72 max-w-full" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="mb-8 h-14 w-full rounded-xl" />
        <MenuGridSkeleton />
      </div>
    </main>
  )
}