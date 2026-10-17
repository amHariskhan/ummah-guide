export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 h-8 w-56 animate-pulse rounded bg-gray-200" />
      <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="space-y-2 p-4">
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </main>
  );
}