// Grey pulsing placeholder shown while an admin page loads
export default function AdminSkeleton() {
  return (
    <div>
      {/* Header bar */}
      <div className="flex h-16 items-center border-b border-gray-200 bg-white px-6 md:px-8">
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-64 animate-pulse rounded bg-gray-100" />
        </div>
      </div>

      <div className="space-y-6 p-6 md:p-8">
        {/* Card row */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-20 animate-pulse rounded-xl border border-gray-200 bg-white" />
          ))}
        </div>

        {/* List */}
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="space-y-2 p-5">
              <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}