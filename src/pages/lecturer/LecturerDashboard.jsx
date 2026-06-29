import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ClipboardCheck, CheckCircle2, XCircle, Building2 } from 'lucide-react';
import { getAllRegistrations } from '../../api/registrationApi';
import { useAuth } from '../../context/AuthContext';

const LecturerDashboard = () => {
  const { user } = useAuth();

  const { data: pending, isLoading: pendingLoading } = useQuery({
    queryKey: ['registrations', 'submitted'],
    queryFn: () => getAllRegistrations('submitted'),
  });

  const { data: approved, isLoading: approvedLoading } = useQuery({
    queryKey: ['registrations', 'approved'],
    queryFn: () => getAllRegistrations('approved'),
  });

  const { data: rejected, isLoading: rejectedLoading } = useQuery({
    queryKey: ['registrations', 'rejected'],
    queryFn: () => getAllRegistrations('rejected'),
  });

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-text-heading'>
          Welcome back, {user?.fullName?.split(' ')[0]}
        </h1>
        <p className='text-text-muted text-sm mt-1 flex items-center gap-1.5'>
          <Building2 size={14} />
          {user?.department?.name || 'Lecturer'} Panel
        </p>
      </div>

      {/* Main action card — the one thing that actually needs attention */}
      <Link
        to='/lecturer/registrations'
        className='card flex items-center justify-between hover:shadow-modal transition-shadow'
      >
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center'>
            <ClipboardCheck size={22} className='text-warning' />
          </div>
          <div>
            <p className='font-semibold text-text-heading'>Pending Registrations</p>
            <p className='text-sm text-text-muted'>
              {pendingLoading ? 'Loading...' : `${pending?.length || 0} awaiting your review`}
            </p>
          </div>
        </div>
        <span className='text-3xl font-bold text-warning'>
          {pendingLoading ? '—' : pending?.length || 0}
        </span>
      </Link>

      {/* Review activity summary */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='card flex items-center gap-4'>
          <div className='w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center'>
            <CheckCircle2 size={18} className='text-success' />
          </div>
          <div>
            <p className='text-2xl font-bold text-text-heading'>
              {approvedLoading ? '—' : approved?.length || 0}
            </p>
            <p className='text-xs text-text-muted'>Total Approved</p>
          </div>
        </div>

        <div className='card flex items-center gap-4'>
          <div className='w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center'>
            <XCircle size={18} className='text-danger' />
          </div>
          <div>
            <p className='text-2xl font-bold text-text-heading'>
              {rejectedLoading ? '—' : rejected?.length || 0}
            </p>
            <p className='text-xs text-text-muted'>Total Rejected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
