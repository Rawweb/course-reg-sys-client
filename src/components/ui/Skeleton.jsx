export const SkeletonBlock = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-border ${className}`} />
);

export const FullPageSkeleton = () => (
  <div className='min-h-screen flex items-center justify-center bg-bg'>
    <div className='w-full max-w-sm space-y-4 px-6'>
      <SkeletonBlock className='h-10 w-3/4 mx-auto' />
      <SkeletonBlock className='h-4 w-full' />
      <SkeletonBlock className='h-4 w-5/6' />
      <SkeletonBlock className='h-32 w-full' />
    </div>
  </div>
);

// A skeleton shaped like a StatCard, shown while dashboard data loads.
export const SkeletonStatCard = () => (
  <div className="card flex items-center justify-between">
    <div className="space-y-2">
      <SkeletonBlock className="h-3 w-20" />
      <SkeletonBlock className="h-6 w-16" />
    </div>
    <SkeletonBlock className="h-12 w-12 rounded-full" />
  </div>
);

// A generic skeleton line, for text placeholders.
export const SkeletonLine = ({ className = "" }) => (
  <SkeletonBlock className={`h-4 ${className}`} />
);
