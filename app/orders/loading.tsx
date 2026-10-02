export default function OrdersLoading() {
  return (
    <main className="bg-background">
      <div
        className="mx-auto max-w-2xl space-y-4 px-4 py-12"
        aria-busy="true"
        aria-label="Loading your orders"
      >
        <div className="mx-auto h-8 w-40 animate-pulse rounded-lg bg-muted" />
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </main>
  )
}