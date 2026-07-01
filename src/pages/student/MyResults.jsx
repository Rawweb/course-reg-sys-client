import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { getMyResults } from '../../api/courseApi';
import Table from '../../components/ui/Table';
import { SkeletonBlock } from '../../components/ui/Skeleton';
import { gradeClass } from '../../utils/constants';

const MyResults = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-results'],
    queryFn: getMyResults,
  });

  const records = data?.records || [];
  const carryovers = data?.carryovers || [];

  // Group the flat records list by level: { 100: [...], 200: [...] }.
  // useMemo so this only recomputes when records change.
  const byLevel = useMemo(() => {
    return records.reduce((groups, rec) => {
      // If we haven't seen this level yet, start an array for it.
      if (!groups[rec.level]) groups[rec.level] = [];
      groups[rec.level].push(rec);
      return groups;
    }, {});
  }, [records]);

  // The levels present, in ascending order, for stable display.
  const levels = Object.keys(byLevel)
    .map(Number)
    .sort((a, b) => a - b);

  if (isLoading) {
    return (
      <div>
        <h1 className='text-2xl font-bold text-text-heading'>My Results</h1>
        <div className='mt-6 space-y-3'>
          <SkeletonBlock className='h-48 w-full' />
          <SkeletonBlock className='h-48 w-full' />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className='text-2xl font-bold text-text-heading'>My Results</h1>
        <p className='mt-6 text-sm text-danger'>Couldn't load your results.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className='text-2xl font-bold text-text-heading'>My Results</h1>
      <p className='mt-1 text-sm text-text-muted'>Your academic history across all levels.</p>

      {/* Carryover alert banner, if any */}
      {carryovers.length > 0 && (
        <div className='mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4'>
          <AlertTriangle className='mt-0.5 shrink-0 text-warning' size={18} />
          <div className='text-sm'>
            <p className='font-medium text-amber-800'>
              You have {carryovers.length} carryover{carryovers.length === 1 ? '' : 's'}
            </p>
            <p className='text-amber-700'>
              Failed course{carryovers.length === 1 ? '' : 's'}: {carryovers.join(', ')}. You can
              re-register {carryovers.length === 1 ? 'it' : 'them'} from Available Courses.
            </p>
          </div>
        </div>
      )}

      {records.length === 0 ? (
        <div className='card mt-6 text-center py-10'>
          <p className='text-sm text-text-muted'>
            No academic records yet. As a new student, your results will appear here after your
            first semester.
          </p>
        </div>
      ) : (
        <div className='mt-6 space-y-6'>
          {levels.map((level) => (
            <div key={level} className='card'>
              <h2 className='mb-3 text-lg font-semibold text-text-heading'>{level} Level</h2>
              <Table headers={['Course', 'Grade', 'Semester', 'Session']}>
                {byLevel[level].map((rec) => (
                  <tr key={rec._id}>
                    <td className='whitespace-nowrap px-4 py-3 font-medium text-text-heading'>
                      {rec.courseCode}
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${gradeClass(
                          rec.grade,
                        )}`}
                      >
                        {rec.grade}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-text'>{rec.semester}</td>
                    <td className='whitespace-nowrap px-4 py-3 text-text'>{rec.session}</td>
                  </tr>
                ))}
              </Table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyResults;
