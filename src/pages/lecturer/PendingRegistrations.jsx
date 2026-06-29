import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAllRegistrations, reviewRegistration } from '../../api/registrationApi';

const PendingRegistrations = () => {
  const queryClient = useQueryClient();

  // We only want to see registrations that are "submitted" —
  // ones the student has locked in and sent for review
  const {
    data: registrations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['registrations', 'submitted'],
    queryFn: () => getAllRegistrations('submitted'),
  });

  // Tracks which registration (if any) currently has the
  // "reject" modal open, and what comment is being typed
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectComment, setRejectComment] = useState('');

  const { mutate: review, isPending } = useMutation({
    mutationFn: reviewRegistration,
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['registrations', 'submitted'] });
      setRejectingId(null);
      setRejectComment('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Action failed');
    },
  });

  const handleApprove = (registrationId) => {
    review({ registrationId, action: 'approved', comment: 'Approved' });
  };

  const handleRejectSubmit = () => {
    if (!rejectComment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    review({ registrationId: rejectingId, action: 'rejected', comment: rejectComment });
  };

  if (isLoading) {
    return <p className='text-text-muted'>Loading pending registrations...</p>;
  }

  if (isError) {
    return <p className='text-danger'>Failed to load registrations.</p>;
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-text-heading'>Pending Registrations</h1>

      {registrations.length === 0 ? (
        <div className='card text-center'>
          <p className='text-text-muted'>No registrations awaiting review.</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {registrations.map((reg) => (
            <div key={reg._id} className='card'>
              <div className='flex items-center justify-between mb-3'>
                <div>
                  <p className='font-semibold text-text-heading'>{reg.student.fullName}</p>
                  <p className='text-sm text-text-muted'>
                    {reg.student.studentInfo?.matricNumber} · {reg.session} · {reg.semester}{' '}
                    semester
                  </p>
                </div>
                <p className='text-sm font-medium text-text-heading'>
                  {reg.totalCreditUnits} units
                </p>
              </div>

              {/* Course list for this registration */}
              <div className='border-t border-border pt-3 mb-4'>
                <p className='text-xs text-text-muted mb-2'>Registered Courses:</p>
                <div className='flex flex-wrap gap-2'>
                  {reg.courses.map((item) => (
                    <span
                      key={item.course._id}
                      className='text-xs bg-bg border border-border rounded-full px-3 py-1 text-text'
                    >
                      {item.course.courseCode}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className='flex gap-3'>
                <button
                  onClick={() => handleApprove(reg._id)}
                  disabled={isPending}
                  className='btn w-auto px-5 bg-success hover:bg-green-700'
                >
                  Approve
                </button>
                <button
                  onClick={() => setRejectingId(reg._id)}
                  disabled={isPending}
                  className='w-auto px-5 py-2.5 rounded-lg text-sm font-medium text-danger border border-danger/30 hover:bg-red-50 transition-colors'
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject confirmation modal */}
      {rejectingId && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50'>
          <div className='card max-w-md w-full'>
            <h2 className='font-semibold text-text-heading mb-2'>Reject Registration</h2>
            <p className='text-sm text-text-muted mb-4'>
              Please explain why this registration is being rejected. The student will see this
              comment.
            </p>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              rows={3}
              placeholder='e.g. Please confirm department approval for elective'
              className='w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary resize-none mb-4'
            />
            <div className='flex gap-3'>
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectComment('');
                }}
                className='w-auto px-5 py-2.5 rounded-lg text-sm font-medium text-text border border-border'
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={isPending}
                className='btn w-auto px-5 bg-danger hover:bg-red-700'
              >
                {isPending ? 'Submitting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRegistrations;
