export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" style={{ maxWidth: i === 0 ? "120px" : undefined }} />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            {Array.from({ length: cols }).map((_, j) => (
              <div
                key={j}
                className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"
                style={{ opacity: 0.4 + Math.random() * 0.6, maxWidth: j === 0 ? "120px" : undefined }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
