const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} aria-hidden='true' />
);

export const PageHeaderSkeleton = ({ withAction = false }) => (
  <div className='flex items-center justify-between'>
    <Skeleton className='h-8 w-44' />
    {withAction && <Skeleton className='h-10 w-32 rounded-lg' />}
  </div>
);

export const TableSkeleton = ({ columns = 4, rows = 5, withTitle = false }) => (
  <div className='card overflow-x-auto'>
    {withTitle && <Skeleton className='mb-4 h-5 w-40' />}
    <table className='w-full text-sm'>
      <thead>
        <tr className='border-b border-border'>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index} className='py-2 pr-4'>
              <Skeleton className='h-3 w-20' />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex} className='border-b border-border last:border-0'>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <td key={colIndex} className='py-3 pr-4'>
                <Skeleton
                  className={`h-4 ${
                    colIndex === 0 ? 'w-28' : colIndex === columns - 1 ? 'w-16' : 'w-24'
                  }`}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const StatGridSkeleton = ({ count = 4 }) => (
  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className='card'>
        <Skeleton className='h-10 w-10 rounded-lg mb-3' />
        <Skeleton className='h-7 w-14 mb-2' />
        <Skeleton className='h-4 w-28' />
      </div>
    ))}
  </div>
);

export const RouteLoadingSkeleton = () => (
  <div className='min-h-screen bg-bg p-4 sm:p-8'>
    <div className='mx-auto max-w-6xl space-y-6'>
      <PageHeaderSkeleton />
      <StatGridSkeleton />
      <TableSkeleton columns={5} rows={4} />
    </div>
  </div>
);

export default Skeleton;
