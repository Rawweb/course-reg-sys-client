import { useQuery } from '@tanstack/react-query';
import { getMyResults } from '../../api/resultApi';

// Maps each grade to a badge-like color treatment —
// reusing the same visual language as our registration status badges
const gradeColorMap = {
  A: 'text-success',
  B: 'text-success',
  C: 'text-warning',
  D: 'text-warning',
  E: 'text-danger',
  F: 'text-danger',
};

const MyResults = () => {
  const {
    data: results,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['my-results'],
    queryFn: getMyResults,
  });

  if (isLoading) {
    return <p className='text-text-muted'>Loading your results...</p>;
  }

  if (isError) {
    return <p className='text-danger'>Failed to load results.</p>;
  }

  if (!results || results.length === 0) {
    return (
      <div className='card text-center'>
        <p className='text-text-muted'>No results have been recorded yet.</p>
      </div>
    );
  }

  // Group results by session so the page reads like an academic transcript —
  // one section per session, rather than one long flat table
  const groupedBySession = results.reduce((groups, result) => {
    const key = result.session;
    if (!groups[key]) groups[key] = [];
    groups[key].push(result);
    return groups;
  }, {});

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-text-heading'>My Results</h1>

      {Object.entries(groupedBySession).map(([session, sessionResults]) => (
        <div key={session} className='card'>
          <h2 className='font-semibold text-text-heading mb-3'>{session}</h2>
          <table className='w-full text-sm'>
            <thead>
              <tr className='text-left text-text-muted border-b border-border'>
                <th className='py-2 pr-4'>Code</th>
                <th className='py-2 pr-4'>Title</th>
                <th className='py-2 pr-4'>Semester</th>
                <th className='py-2 pr-4'>Units</th>
                <th className='py-2'>Grade</th>
              </tr>
            </thead>
            <tbody>
              {sessionResults.map((result) => (
                <tr key={result._id} className='border-b border-border last:border-0'>
                  <td className='py-3 pr-4 font-medium text-text-heading'>
                    {result.course.courseCode}
                  </td>
                  <td className='py-3 pr-4 text-text'>{result.course.title}</td>
                  <td className='py-3 pr-4 text-text capitalize'>{result.semester}</td>
                  <td className='py-3 pr-4 text-text'>{result.course.creditUnits}</td>
                  <td className={`py-3 font-semibold ${gradeColorMap[result.grade]}`}>
                    {result.grade}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default MyResults;
