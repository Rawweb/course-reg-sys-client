// src/pages/lecturer/PendingRegistrations.jsx
// The lecturer's approval queue: view each pending registration, approve/reject.

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';
import { getPendingRegistrations, reviewRegistration } from '../../api/registrationApi';
import Table from '../../components/ui/Table';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { SkeletonBlock } from '../../components/ui/Skeleton';

const PendingRegistrations = () => {
  const queryClient = useQueryClient();

  // Modal state: which registration + which decision we're confirming.
  const [modal, setModal] = useState({ open: false, reg: null, decision: null });
  const [feedback, setFeedback] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['pending-registrations'],
    queryFn: getPendingRegistrations,
  });

  const registrations = data?.registrations || [];

  const mutation = useMutation({
    mutationFn: ({ id, decision, feedback }) => reviewRegistration(id, decision, feedback),
    onSuccess: (_, variables) => {
      toast.success(`Registration ${variables.decision}d.`);
      // Refresh the queue AND the dashboard count.
      queryClient.invalidateQueries({ queryKey: ['pending-registrations'] });
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Action failed.');
    },
  });

  // Open the modal for a given registration + decision.
  const openModal = (reg, decision) => {
    setFeedback('');
    setModal({ open: true, reg, decision });
  };

  const closeModal = () => {
    setModal({ open: false, reg: null, decision: null });
    setFeedback('');
  };

  const confirmDecision = () => {
    // Reject requires feedback (mirrors the backend rule).
    if (modal.decision === 'reject' && feedback.trim() === '') {
      toast.error('Please provide feedback when rejecting.');
      return;
    }
    mutation.mutate({
      id: modal.reg._id,
      decision: modal.decision,
      feedback: feedback.trim(),
    });
  };

  return (
    <div>
      <h1 className='text-2xl font-bold text-text-heading'>Pending Approvals</h1>
      <p className='mt-1 text-sm text-text-muted'>
        Registrations from your advising level awaiting review.
      </p>

      {isLoading ? (
        <div className='mt-6 space-y-3'>
          <SkeletonBlock className='h-52 w-full' />
          <SkeletonBlock className='h-52 w-full' />
        </div>
      ) : isError ? (
        <p className='mt-6 text-sm text-danger'>Couldn't load the queue.</p>
      ) : registrations.length === 0 ? (
        <div className='card mt-6 text-center py-10'>
          <p className='text-sm text-text-muted'>
            Your queue is clear — no registrations awaiting approval.
          </p>
        </div>
      ) : (
        <div className='mt-6 space-y-6'>
          {registrations.map((reg) => (
            <div key={reg._id} className='card'>
              {/* Student header */}
              <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <h2 className='text-lg font-semibold text-text-heading'>{reg.student?.name}</h2>
                  <p className='text-sm text-text-muted'>
                    {reg.matricNumber} · Semester {reg.semester} · {reg.totalUnits} units
                  </p>
                </div>
              </div>

              {/* Courses */}
              <Table headers={['Code', 'Title', 'Units', 'Type']}>
                {reg.courses.map((c) => (
                  <tr key={c.courseCode}>
                    <td className='whitespace-nowrap px-4 py-3 font-medium text-text-heading'>
                      {c.courseCode}
                    </td>
                    <td className='px-4 py-3 text-text'>{c.title}</td>
                    <td className='px-4 py-3 text-text'>{c.unit}</td>
                    <td className='px-4 py-3'>
                      {c.isCarryover ? (
                        <span className='rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700'>
                          Carryover
                        </span>
                      ) : (
                        <span className='text-text-muted'>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>

              {/* Action buttons */}
              <div className='mt-4 flex gap-2'>
                <button
                  onClick={() => openModal(reg, 'approve')}
                  className='flex items-center gap-1.5 rounded-lg bg-success px-4 py-2 text-sm
                             font-medium text-white hover:bg-green-700 transition-colors'
                >
                  <Check size={16} /> Approve
                </button>
                <button
                  onClick={() => openModal(reg, 'reject')}
                  className='flex items-center gap-1.5 rounded-lg bg-danger px-4 py-2 text-sm
                             font-medium text-white hover:bg-red-700 transition-colors'
                >
                  <X size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* The confirm modal, shared for both decisions */}
      <ConfirmModal
        open={modal.open}
        title={modal.decision === 'approve' ? 'Approve Registration' : 'Reject Registration'}
        message={
          modal.decision === 'approve'
            ? `Approve ${modal.reg?.student?.name}'s registration (${modal.reg?.totalUnits} units)?`
            : `Reject ${modal.reg?.student?.name}'s registration? Please explain why.`
        }
        confirmLabel={modal.decision === 'approve' ? 'Approve' : 'Reject'}
        confirmColor={modal.decision === 'approve' ? 'primary' : 'danger'}
        loading={mutation.isPending}
        onConfirm={confirmDecision}
        onCancel={closeModal}
        showNote={modal.decision === 'reject'}
        noteValue={feedback}
        onNoteChange={setFeedback}
        notePlaceholder='e.g. Missing prerequisite for COS201; please drop it.'
      />
    </div>
  );
};

export default PendingRegistrations;
