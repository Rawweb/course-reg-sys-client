import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getMyRegistrations } from '../../api/courseApi';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { SkeletonBlock } from '../../components/ui/Skeleton';

const MyRegistration = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: getMyRegistrations,
  });

  const registrations = data?.registrations || [];

  if (isLoading) {
    return (
      <div>
        <h1 className='text-2xl font-bold text-text-heading'>My Registration</h1>
        <div className='mt-6 space-y-3'>
          <SkeletonBlock className='h-40 w-full' />
          <SkeletonBlock className='h-40 w-full' />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className='text-2xl font-bold text-text-heading'>My Registration</h1>
        <p className='mt-6 text-sm text-danger'>Couldn't load your registrations.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className='text-2xl font-bold text-text-heading'>My Registration</h1>
      <p className='mt-1 text-sm text-text-muted'>
        Your submitted course registrations and their status.
      </p>

      {registrations.length === 0 ? (
        <div className='card mt-6 text-center py-10'>
          <p className='text-sm text-text-muted'>You haven't registered any courses yet.</p>
          <Link
            to='/student/courses'
            className='mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm
                       font-medium text-white hover:bg-primary-hover transition-colors'
          >
            Register Courses
          </Link>
        </div>
      ) : (
        <div className='mt-6 space-y-6'>
          {registrations.map((reg) => (
            <div key={reg._id} className='card'>
              {/* Header: session/semester + status badge */}
              <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <h2 className='text-lg font-semibold text-text-heading'>
                    {reg.session} · Semester {reg.semester}
                  </h2>
                  <p className='text-sm text-text-muted'>
                    {reg.courses.length} courses · {reg.totalUnits} total units
                  </p>
                </div>
                <Badge status={reg.status} />
              </div>

              {/* Rejection feedback, if any */}
              {reg.status === 'rejected' && reg.feedback && (
                <div className='mb-4 rounded-lg bg-red-50 p-3 text-sm text-danger'>
                  <span className='font-medium'>Adviser feedback: </span>
                  {reg.feedback}
                </div>
              )}

              {/* Approval note */}
              {reg.status === 'approved' && (
                <div className='mb-4 rounded-lg bg-green-50 p-3 text-sm text-success'>
                  Your registration has been approved
                  {reg.reviewedBy?.name ? ` by ${reg.reviewedBy.name}` : ''}.
                </div>
              )}

              {/* Courses table */}
              <Table headers={['Code', 'Title', 'Units']}>
                {reg.courses.map((c) => (
                  <tr key={c.courseCode}>
                    <td className='whitespace-nowrap px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium text-text-heading'>{c.courseCode}</span>
                        {c.isCarryover && (
                          <span className='rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700'>
                            Carryover
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-text'>{c.title}</td>
                    <td className='px-4 py-3 text-text'>{c.unit}</td>
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

export default MyRegistration;
