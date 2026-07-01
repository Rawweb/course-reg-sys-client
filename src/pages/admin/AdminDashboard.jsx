import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, ClipboardList, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentRegistrationReport } from '../../api/reportApi';
import StatCard from '../../components/ui/StatCard';
import { SkeletonStatCard } from '../../components/ui/Skeleton';

const AdminDashboard = () => {
  const { user } = useAuth();

  // One call returns all registrations; we derive counts from it.
  const { data, isLoading } = useQuery({
    queryKey: ['report-student-registration'],
    queryFn: getStudentRegistrationReport,
  });

  // Derive the counts from the rows.
  const stats = useMemo(() => {
    const rows = data?.rows || [];
    return {
      total: rows.length,
      approved: rows.filter((r) => r.status === 'approved').length,
      pending: rows.filter((r) => r.status === 'pending').length,
      rejected: rows.filter((r) => r.status === 'rejected').length,
    };
  }, [data]);

  return (
    <div>
      <h1 className='text-2xl font-bold text-text-heading'>Welcome, {user?.name?.split(' ')[0]}</h1>
      <p className='mt-1 text-sm text-text-muted'>System Administrator</p>

      {/* Stat cards */}
      <div className='mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {isLoading ? (
          [...Array(4)].map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <StatCard
              label='Total Registrations'
              value={stats.total}
              icon={ClipboardList}
              accent='primary'
            />
            <StatCard
              label='Approved'
              value={stats.approved}
              icon={CheckCircle2}
              accent='success'
            />
            <StatCard label='Pending' value={stats.pending} icon={Clock} accent='warning' />
            <StatCard label='Rejected' value={stats.rejected} icon={XCircle} accent='danger' />
          </>
        )}
      </div>

      {/* Reports shortcut */}
      <div className='card mt-6'>
        <div className='flex items-start gap-3'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <Users size={22} />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-text-heading'>Reports</h2>
            <p className='mt-1 text-sm text-text-muted'>
              Generate and review registration reports across all departments — student
              registrations, course enrollment, prerequisite validation, and unit-load monitoring.
            </p>
            <Link
              to='/admin/reports'
              className='mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm
                         font-medium text-white hover:bg-primary-hover transition-colors'
            >
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
