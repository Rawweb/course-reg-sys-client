import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Building2, ClipboardList, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyRegistrations } from '../../api/courseApi';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import { SkeletonStatCard, SkeletonLine } from '../../components/ui/Skeleton';
import { CURRENT_SESSION } from '../../utils/constants';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: getMyRegistrations,
  });

  const registrations = data?.registrations || [];
  const currentReg = registrations.find((r) => r.session === CURRENT_SESSION);

  return (
    <div>
      {/* Greeting */}
      <h1 className='text-2xl font-bold text-text-heading'>Welcome, {user?.name?.split(' ')[0]}</h1>
      <p className='mt-1 text-sm text-text-muted'>
        {user?.department} · {user?.level} Level · {CURRENT_SESSION}
      </p>

      {/* Stat cards */}
      <div className='mt-6 grid grid-cols-2 gap-4 lg:grid-cols-2 xl:grid-cols-4'>
        {/* Level and Department come straight from the user — no loading needed */}
        <StatCard label='Level' value={`${user?.level}L`} icon={Layers} accent='primary' />
        <StatCard
          label='Department'
          value={user?.department?.split(' ')[0]}
          icon={Building2}
          accent='info'
        />

        {/* Registration status + total units depend on the query */}
        {isLoading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            <StatCard
              label='Reg. Status'
              value={currentReg ? currentReg.status : 'None'}
              icon={ClipboardList}
              accent={
                currentReg?.status === 'approved'
                  ? 'success'
                  : currentReg?.status === 'rejected'
                    ? 'danger'
                    : 'warning'
              }
            />
            <StatCard
              label='Total Units'
              value={currentReg ? currentReg.totalUnits : 0}
              icon={GraduationCap}
              accent='secondary'
            />
          </>
        )}
      </div>

      {/* Latest registration summary */}
      <div className='card mt-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-text-heading'>Current Registration</h2>
          <Link
            to='/student/registration'
            className='text-sm font-medium text-primary hover:text-primary-hover'
          >
            View details →
          </Link>
        </div>

        {isLoading ? (
          <div className='space-y-3'>
            <SkeletonLine className='w-1/2' />
            <SkeletonLine className='w-1/3' />
          </div>
        ) : isError ? (
          <p className='text-sm text-danger'>Couldn't load your registration.</p>
        ) : currentReg ? (
          <div className='space-y-2 text-sm text-text'>
            <div className='flex items-center gap-2'>
              <span className='text-text-muted'>Status:</span>
              <Badge status={currentReg.status} />
            </div>
            <p>
              <span className='text-text-muted'>Semester:</span> {currentReg.semester}
            </p>
            <p>
              <span className='text-text-muted'>Courses:</span> {currentReg.courses.length}
            </p>
            <p>
              <span className='text-text-muted'>Total Units:</span> {currentReg.totalUnits}
            </p>
            {currentReg.status === 'rejected' && currentReg.feedback && (
              <p className='rounded-lg bg-red-50 p-3 text-danger'>
                <span className='font-medium'>Feedback:</span> {currentReg.feedback}
              </p>
            )}
          </div>
        ) : (
          // No registration yet — nudge them to register.
          <div className='text-center py-6'>
            <p className='text-sm text-text-muted'>
              You haven't registered any courses for {CURRENT_SESSION} yet.
            </p>
            <Link
              to='/student/courses'
              className='mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm
                         font-medium text-white hover:bg-primary-hover transition-colors'
            >
              Register Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
