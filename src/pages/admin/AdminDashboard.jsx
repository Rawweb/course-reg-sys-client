import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, UserCheck, BookOpen, Building2 } from 'lucide-react';
import { getUsers } from '../../api/userApi';
import { getCourses } from '../../api/courseApi';
import { getDepartments } from '../../api/departmentApi';
import { useAuth } from '../../context/AuthContext';
import Skeleton from '../../components/Skeleton';

const AdminDashboard = () => {
  const { user } = useAuth();

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['users', 'student'],
    queryFn: () => getUsers({ role: 'student' }),
  });

  const { data: lecturers, isLoading: lecturersLoading } = useQuery({
    queryKey: ['users', 'lecturer'],
    queryFn: () => getUsers({ role: 'lecturer' }),
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', 'all-for-dashboard'],
    queryFn: () => getCourses(),
  });

  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const pendingLecturers = lecturers?.filter((l) => !l.isActive).length || 0;

  const stats = [
    {
      label: 'Total Students',
      value: students?.length,
      icon: Users,
      isLoading: studentsLoading,
      to: '/admin/users',
    },
    {
      label: 'Pending Lecturer Activations',
      value: pendingLecturers,
      icon: UserCheck,
      isLoading: lecturersLoading,
      highlight: pendingLecturers > 0,
      to: '/admin/users',
    },
    {
      label: 'Total Courses',
      value: courses?.length,
      icon: BookOpen,
      isLoading: coursesLoading,
      to: '/admin/courses',
    },
    {
      label: 'Total Departments',
      value: departments?.length,
      icon: Building2,
      isLoading: departmentsLoading,
      to: '/admin/departments',
    },
  ];

  const studentsByDepartment = departments?.map((dept) => {
    const count =
      students?.filter((s) => {
        const studentDeptId = s.department?._id || s.department;
        return studentDeptId === dept._id;
      }).length || 0;
    return { ...dept, studentCount: count };
  });

  const maxCount = Math.max(...(studentsByDepartment?.map((d) => d.studentCount) || [1]), 1);

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-text-heading'>
          Welcome back, {user?.fullName?.split(' ')[0]}
        </h1>
        <p className='text-text-muted text-sm mt-1'>Admin Panel</p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {stats.map(({ label, value, icon: Icon, highlight, isLoading, to }) => (
          <Link key={label} to={to} className='card hover:shadow-modal transition-shadow'>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                highlight ? 'bg-amber-100' : 'bg-primary/10'
              }`}
            >
              <Icon size={18} className={highlight ? 'text-warning' : 'text-primary'} />
            </div>
            {isLoading ? (
              <Skeleton className='mb-2 h-7 w-12' />
            ) : (
              <p className='text-2xl font-bold text-text-heading'>
                {value !== undefined ? value : '-'}
              </p>
            )}
            <p className='text-sm text-text-muted mt-1'>{label}</p>
          </Link>
        ))}
      </div>

      <div className='card'>
        <h2 className='font-semibold text-text-heading mb-4'>Students by Department</h2>
        <div className='space-y-3'>
          {studentsLoading || departmentsLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <div className='flex items-center justify-between mb-2'>
                  <Skeleton className='h-4 w-40' />
                  <Skeleton className='h-4 w-20' />
                </div>
                <Skeleton className='h-2 w-full rounded-full' />
              </div>
            ))
          ) : (
            studentsByDepartment?.map((dept) => (
              <div key={dept._id}>
                <div className='flex items-center justify-between text-sm mb-1'>
                  <span className='text-text font-medium'>{dept.name}</span>
                  <span className='text-text-muted'>{dept.studentCount} students</span>
                </div>
                <div className='w-full bg-bg rounded-full h-2 overflow-hidden'>
                  <div
                    className='bg-primary h-full rounded-full transition-all'
                    style={{ width: `${(dept.studentCount / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
