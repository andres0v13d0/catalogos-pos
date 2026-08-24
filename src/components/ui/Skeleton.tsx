export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded bg-gray-200 ${className}`}
      style={{
        background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
        ...style,
      }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md">
      <Skeleton className="w-full h-48" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <Skeleton className="h-5 w-1/3 mx-auto" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 pb-32 mt-4">
      {/* Mobile: masonry 2 col skeleton */}
      <div className="md:hidden flex gap-2 items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {[160, 200, 140].map((h, i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
              <Skeleton className="w-full" style={{ height: h }} />
              <div className="p-2 space-y-1">
                <Skeleton className="h-2.5 w-4/5" />
                <Skeleton className="h-3.5 w-2/5" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {[180, 150, 210].map((h, i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
              <Skeleton className="w-full" style={{ height: h }} />
              <div className="p-2 space-y-1">
                <Skeleton className="h-2.5 w-4/5" />
                <Skeleton className="h-3.5 w-2/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Desktop: grid skeleton */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
