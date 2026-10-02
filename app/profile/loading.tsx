export default function ProfileLoading() {
  return (
    <main className="bg-background">
      <div
        className="mx-auto max-w-2xl space-y-4 px-4 py-12"
        aria-busy="true"
        aria-label="Loading your profile"
      >
        <div className="mx-auto h-8 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="h-80 animate-pulse rounded-2xl bg-muted" />
      </div>
    </main>
  )
}