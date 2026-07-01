import { useQuery } from '@tanstack/react-query';
import {
  GraduationCap,
  Building2,
  ClipboardList,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
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
          <div>
            {/* Status banner — color-coded, with an icon */}
            <div
              className={`flex items-center gap-3 rounded-lg p-4 ${
                currentReg.status === 'approved'
                  ? 'bg-green-50'
                  : currentReg.status === 'rejected'
                    ? 'bg-red-50'
                    : 'bg-amber-50'
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  currentReg.status === 'approved'
                    ? 'bg-green-100 text-success'
                    : currentReg.status === 'rejected'
                      ? 'bg-red-100 text-danger'
                      : 'bg-amber-100 text-warning'
                }`}
              >
                {currentReg.status === 'approved' ? (
                  <CheckCircle2 size={20} />
                ) : currentReg.status === 'rejected' ? (
                  <XCircle size={20} />
                ) : (
                  <Clock size={20} />
                )}
              </div>
              <div>
                <p className='text-sm font-semibold text-text-heading capitalize'>
                  {currentReg.status}
                </p>
                <p className='text-xs text-text-muted'>
                  {currentReg.status === 'approved'
                    ? 'Your registration has been approved.'
                    : currentReg.status === 'rejected'
                      ? 'Your registration needs changes.'
                      : "Awaiting your adviser's review."}
                </p>
              </div>
            </div>

            {/* Key numbers as pills */}
            <div className='mt-4 grid grid-cols-3 gap-3'>
              <div className='rounded-lg border border-border bg-slate-50 p-3 text-center'>
                <p className='text-lg font-bold text-text-heading'>{currentReg.semester}</p>
                <p className='text-[11px] uppercase tracking-wide text-text-muted'>Semester</p>
              </div>
              <div className='rounded-lg border border-border bg-slate-50 p-3 text-center'>
                <p className='text-lg font-bold text-text-heading'>{currentReg.courses.length}</p>
                <p className='text-[11px] uppercase tracking-wide text-text-muted'>Courses</p>
              </div>
              <div className='rounded-lg border border-border bg-slate-50 p-3 text-center'>
                <p className='text-lg font-bold text-text-heading'>{currentReg.totalUnits}</p>
                <p className='text-[11px] uppercase tracking-wide text-text-muted'>Units</p>
              </div>
            </div>

            {/* Rejection feedback, if any */}
            {currentReg.status === 'rejected' && currentReg.feedback && (
              <div className='mt-4 rounded-lg border-l-4 border-danger bg-red-50 p-3'>
                <p className='text-xs font-semibold uppercase tracking-wide text-danger'>
                  Adviser Feedback
                </p>
                <p className='mt-1 text-sm text-text'>{currentReg.feedback}</p>
              </div>
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
