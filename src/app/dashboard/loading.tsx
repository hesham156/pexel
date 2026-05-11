export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome banner */}
      <div className="h-28 bg-gradient-to-l from-primary-600 to-purple-600 rounded-2xl opacity-60" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>

      {/* Orders list */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
