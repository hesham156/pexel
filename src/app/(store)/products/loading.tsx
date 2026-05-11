export default function ProductsLoading() {
  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        <div className="flex gap-8">
          {/* Sidebar skeleton */}
          <div className="hidden lg:block w-64 shrink-0 space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
              ))}
            </div>
          </div>

          {/* Grid skeleton */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-9 w-36 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                  <div className="h-44 bg-gray-200 dark:bg-gray-700" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
