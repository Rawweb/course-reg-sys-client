import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, Layers, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPendingRegistrations } from '../../api/registrationApi';
import StatCard from '../../components/ui/StatCard';
import { SkeletonStatCard } from '../../components/ui/Skeleton';

const LecturerDashboard = () => {
  const { user } = useAuth();

  // Fetch the lecturer's pending queue (used here just for the count).
  const { data, isLoading } = useQuery({
    queryKey: ['pending-registrations'],
    queryFn: getPendingRegistrations,
  });

  const pendingCount = data?.count ?? 0;

  return (
    <div>
      <h1 className='text-2xl font-bold text-text-heading'>Welcome, {user?.name?.split(' ')[0]}</h1>
      <p className='mt-1 text-sm text-text-muted'>
        {user?.department} · {user?.level} Level Adviser
      </p>

      {/* Stat cards */}
      <div className='mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3'>
        <StatCard
          label='Department'
          value={user?.department?.split(' ')[0]}
          icon={Building2}
          accent='info'
        />
        <StatCard label='Level Advised' value={`${user?.level}L`} icon={Layers} accent='primary' />

        {isLoading ? (
          <SkeletonStatCard />
        ) : (
          <StatCard
            label='Pending'
            value={pendingCount}
            icon={ClipboardCheck}
            accent={pendingCount > 0 ? 'warning' : 'success'}
          />
        )}
      </div>

      {/* Call to action */}
      <div className='card mt-6'>
        <h2 className='text-lg font-semibold text-text-heading'>Registration Approvals</h2>
        {isLoading ? (
          <p className='mt-2 text-sm text-text-muted'>Checking your queue…</p>
        ) : pendingCount > 0 ? (
          <div className='mt-2'>
            <p className='text-sm text-text'>
              You have <span className='font-semibold text-text-heading'>{pendingCount}</span>{' '}
              registration{pendingCount === 1 ? '' : 's'} awaiting your review.
            </p>
            <Link
              to='/lecturer/registrations'
              className='mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm
                         font-medium text-white hover:bg-primary-hover transition-colors'
            >
              Review Now
            </Link>
          </div>
        ) : (
          <p className='mt-2 text-sm text-text-muted'>
            No registrations are waiting for your approval right now.
          </p>
        )}
      </div>
    </div>
  );
};

export default LecturerDashboard;
