import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Layers,
  Building2,
  Calendar,
  CalendarClock,
  ArrowUpRight,
} from 'lucide-react';
import { getMyRegistrations } from '../../api/registrationApi';
import { getDepartments } from '../../api/departmentApi';
import { useAuth } from '../../context/AuthContext';
import CircularProgress from '../../components/CircularProgress';
import Skeleton from '../../components/Skeleton';

const statusBadgeMap = {
  pending: 'badge-pending',
  submitted: 'badge-submitted',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
};

const StudentDashboard = () => {
  const { user } = useAuth();

  const { data: registrations, isLoading: regLoading } = useQuery({
    queryKey: ['my-registration'],
    queryFn: getMyRegistrations,
  });

  const { data: departments, isLoading: deptLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const latestRegistration = registrations?.[0];

  // Find this student's own department record so we can read its unit limits
  const departmentId = user?.department?._id || user?.department;
  const myDepartment = departments?.find((d) => d._id === departmentId);

  const registeredUnits = latestRegistration?.totalCreditUnits || 0;
  const maxUnits = myDepartment?.maxUnitsPerSemester || 24;
  const remainingUnits = Math.max(maxUnits - registeredUnits, 0);

  const quickActions = [
    {
      label: 'Register Courses',
      sublabel: 'Add courses for this semester',
      icon: BookOpen,
      to: '/student/courses',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'My Registration',
      sublabel: 'View status and submit for approval',
      icon: ClipboardList,
      to: '/student/registration',
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'My Results',
      sublabel: 'View your academic record',
      icon: GraduationCap,
      to: '/student/results',
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-text-heading'>
          Welcome back, {user?.fullName?.split(' ')[0]}
        </h1>
        <p className='text-text-muted text-sm mt-1'>Here's your current academic overview</p>
      </div>

      {/* Stat cards — student's own context at a glance */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard icon={Layers} label='Current Level' value={`${user?.studentInfo?.level} Level`} />
        <StatCard
          icon={Building2}
          label='Your Department'
          value={user?.department?.name || myDepartment?.name || '—'}
        />
        <StatCard
          icon={Calendar}
          label='Current Session'
          value={user?.studentInfo?.currentSession || latestRegistration?.session || '—'}
        />
        <StatCard
          icon={CalendarClock}
          label='Current Semester'
          value={
            user?.studentInfo?.currentSemester
              ? `${user.studentInfo.currentSemester} Semester`
              : '—'
          }
          valueClass='capitalize'
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Quick actions — spans 2 columns on large screens */}
        <div className='lg:col-span-2 space-y-3'>
          <h2 className='font-semibold text-text-heading'>Quick Actions</h2>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            {quickActions.map(({ label, sublabel, icon: Icon, to, color }) => (
              <Link
                key={to}
                to={to}
                className='card hover:shadow-modal hover:-translate-y-0.5 transition-all flex items-start justify-between'
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}
                  >
                    <Icon size={22} />
                  </div>
                  <p className='font-semibold text-text-heading text-sm'>{label}</p>
                  <p className='text-xs text-text-muted mt-1'>{sublabel}</p>
                </div>
                <ArrowUpRight size={16} className='text-text-muted mt-1' />
              </Link>
            ))}
          </div>

          {/* Registration status card */}
          <div className='card mt-3'>
            <h2 className='font-semibold text-text-heading mb-3'>Current Registration</h2>
            {regLoading ? (
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <Skeleton className='h-4 w-36' />
                  <Skeleton className='h-7 w-20 rounded-full' />
                </div>
                <div className='flex flex-wrap gap-2'>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className='h-7 w-16 rounded-full' />
                  ))}
                </div>
              </div>
            ) : latestRegistration ? (
              <>
                <div className='flex items-center justify-between mb-3'>
                  <p className='text-sm text-text-muted'>
                    {latestRegistration.session} · {latestRegistration.totalCreditUnits} units
                  </p>
                  <span className={statusBadgeMap[latestRegistration.status]}>
                    {latestRegistration.status}
                  </span>
                </div>
                {/* Show which courses are actually registered */}
                <div className='flex flex-wrap gap-2'>
                  {latestRegistration.courses.map((item) => (
                    <span
                      key={item.course._id}
                      className='text-xs bg-bg border border-border rounded-full px-3 py-1 text-text'
                    >
                      {item.course.courseCode}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className='text-text-muted text-sm'>You haven't started a registration yet.</p>
            )}
          </div>
        </div>

        {/* Unit load summary — the standout visual piece */}
        <div className='card flex flex-col items-center'>
          <h2 className='font-semibold text-text-heading mb-4 self-start'>Unit Load Summary</h2>
          {regLoading || deptLoading ? (
            <>
              <Skeleton className='h-36 w-36 rounded-full' />
              <div className='w-full mt-4 space-y-3'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-11/12' />
                <Skeleton className='h-4 w-10/12' />
              </div>
            </>
          ) : (
            <>
              <CircularProgress value={registeredUnits} max={maxUnits} label='Units' />
              <div className='w-full mt-4 space-y-2 text-sm'>
                <LegendRow color='bg-primary' label='Registered Units' value={registeredUnits} />
                <LegendRow color='bg-secondary' label='Remaining Units' value={remainingUnits} />
                <LegendRow color='bg-text-muted' label='Maximum Allowed' value={maxUnits} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Small reusable stat card for the top row
const StatCard = ({ icon: Icon, label, value, valueClass = 'text-text-heading' }) => (
  <div className='card'>
    <Icon size={18} className='text-primary mb-2' />
    <p className={`font-semibold text-sm ${valueClass}`}>{value}</p>
    <p className='text-xs text-text-muted mt-1'>{label}</p>
  </div>
);

// Small reusable row for the unit load legend
const LegendRow = ({ color, label, value }) => (
  <div className='flex items-center justify-between'>
    <span className='flex items-center gap-2 text-text-muted'>
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      {label}
    </span>
    <span className='font-medium text-text-heading'>{value}</span>
  </div>
);

export default StudentDashboard;
