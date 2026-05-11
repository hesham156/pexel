export default function Loading() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 rounded-2xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-36 rounded-2xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    </div>
  );
}
