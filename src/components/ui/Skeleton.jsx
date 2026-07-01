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
