import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getMyRegistrations, submitRegistration } from '../../api/registrationApi';
import Skeleton, { PageHeaderSkeleton, TableSkeleton } from '../../components/Skeleton';

// Maps each status to the matching badge class we defined in index.css
const statusBadgeMap = {
  pending: 'badge-pending',
  submitted: 'badge-submitted',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
};

const MyRegistration = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-registration'],
    queryFn: getMyRegistrations,
  });

  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: submitRegistration,
    onSuccess: (response) => {
      toast.success(response.message || 'Submitted for approval');
      // Refresh this page's data so the status badge updates immediately
      queryClient.invalidateQueries({ queryKey: ['my-registration'] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Submission failed';
      toast.error(message);
    },
  });

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <PageHeaderSkeleton />
        <div className='card'>
          <div className='flex items-center justify-between mb-4'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-36' />
              <Skeleton className='h-6 w-32' />
            </div>
            <Skeleton className='h-7 w-20 rounded-full' />
          </div>
          <Skeleton className='h-10 w-full rounded-lg' />
        </div>
        <TableSkeleton columns={3} rows={4} withTitle />
      </div>
    );
  }

  if (isError) {
    return <p className='text-danger'>Failed to load registration data.</p>;
  }

  // The backend returns an array (a student could have registrations
  // across multiple sessions/semesters over time), so we take the most
  // recent one — the backend already sorts by createdAt descending
  const registration = data?.[0];

  if (!registration) {
    return (
      <div className='card text-center'>
        <p className='text-text-muted'>
          You haven't registered any courses yet. Visit "Available Courses" to get started.
        </p>
      </div>
    );
  }

  const { status, courses, totalCreditUnits, session, semester, reviewComment } = registration;

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-text-heading'>My Registration</h1>

      {/* Summary card */}
      <div className='card'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <p className='text-sm text-text-muted'>
              {session} · {semester} semester
            </p>
            <p className='text-lg font-bold text-text-heading'>{totalCreditUnits} Credit Units</p>
          </div>
          <span className={statusBadgeMap[status]}>{status}</span>
        </div>

        {/* Show the lecturer's comment if the registration was rejected */}
        {status === 'rejected' && reviewComment && (
          <div className='bg-red-50 border border-danger/20 rounded-lg p-3 mb-4'>
            <p className='text-sm text-danger font-medium'>Rejection reason:</p>
            <p className='text-sm text-text mt-1'>{reviewComment}</p>
          </div>
        )}

        {/* Action area — changes based on status */}
        {status === 'pending' && (
          <button onClick={() => submit(registration._id)} disabled={isSubmitting} className='btn'>
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </button>
        )}

        {status === 'submitted' && (
          <p className='text-sm text-text-muted'>
            Your registration has been submitted and is awaiting lecturer approval.
          </p>
        )}

        {status === 'approved' && (
          <p className='text-sm text-success font-medium'>
            Your registration has been approved. No further action needed.
          </p>
        )}

        {status === 'rejected' && (
          <p className='text-sm text-text-muted'>
            Visit "Available Courses" to update your selection and resubmit.
          </p>
        )}
      </div>

      {/* Registered courses table */}
      <div className='card'>
        <h2 className='font-semibold text-text-heading mb-3'>Registered Courses</h2>
        <table className='w-full text-sm'>
          <thead>
            <tr className='text-left text-text-muted border-b border-border'>
              <th className='py-2 pr-4'>Code</th>
              <th className='py-2 pr-4'>Title</th>
              <th className='py-2'>Units</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((item) => (
              <tr key={item.course._id} className='border-b border-border last:border-0'>
                <td className='py-3 pr-4 font-medium text-text-heading'>
                  {item.course.courseCode}
                </td>
                <td className='py-3 pr-4 text-text'>{item.course.title}</td>
                <td className='py-3 text-text'>{item.creditUnits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyRegistration;
