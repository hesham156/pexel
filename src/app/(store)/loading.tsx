export default function StoreLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="hero-gradient py-20 md:py-32">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="h-6 w-48 bg-white/20 rounded-full mx-auto animate-pulse" />
            <div className="space-y-3">
              <div className="h-12 bg-white/20 rounded-xl animate-pulse" />
              <div className="h-12 w-3/4 bg-white/20 rounded-xl mx-auto animate-pulse" />
            </div>
            <div className="h-5 w-2/3 bg-white/10 rounded animate-pulse mx-auto" />
            <div className="flex justify-center gap-3">
              <div className="h-12 w-36 bg-white/20 rounded-xl animate-pulse" />
              <div className="h-12 w-36 bg-white/10 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Products skeleton */}
      <div className="py-16 container-custom">
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="flex gap-2 mt-2">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl mt-2" />
      </div>
    </div>
  );
}
