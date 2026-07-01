export const SkeletonBlock = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-border ${className}`} />
);

export const FullPageSkeleton = () => (
  <div className='min-h-screen flex flex-col items-center justify-center bg-bg gap-4'>
    {/* A small pulsing brand mark */}
    <div className='h-12 w-12 animate-pulse rounded-xl bg-primary/20' />
    <div className='h-3 w-32 animate-pulse rounded-full bg-border' />
  </div>
);

// A skeleton shaped like a StatCard, shown while dashboard data loads.
export const SkeletonStatCard = () => (
  <div className='card flex items-center justify-between'>
    <div className='space-y-2'>
      <SkeletonBlock className='h-3 w-20' />
      <SkeletonBlock className='h-6 w-16' />
    </div>
    <SkeletonBlock className='h-12 w-12 rounded-full' />
  </div>
);

// A generic skeleton line, for text placeholders.
export const SkeletonLine = ({ className = '' }) => (
  <SkeletonBlock className={`h-4 ${className}`} />
);
