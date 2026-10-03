import clsx from 'clsx'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx('rounded-lg bg-brand-pink/50 motion-safe:animate-pulse', className)}
    />
  )
}