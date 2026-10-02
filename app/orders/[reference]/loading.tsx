export default function OrderDetailLoading() {
  return (
    <main className="bg-background">
      <div
        className="mx-auto max-w-2xl space-y-4 px-4 py-12"
        aria-busy="true"
        aria-label="Loading your order"
      >
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    </main>
  )
}