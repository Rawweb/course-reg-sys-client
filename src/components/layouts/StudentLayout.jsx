import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, BookOpen, ClipboardList, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Each nav link: label, path, and icon
  const navLinks = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Available Courses', path: '/student/courses', icon: BookOpen },
    { label: 'My Registration', path: '/student/registration', icon: ClipboardList },
    { label: 'My Results', path: '/student/results', icon: GraduationCap },
  ];

  return (
    <div className='flex min-h-screen bg-bg'>
      {/* Sidebar */}
      <aside className='w-64 bg-surface border-r border-border flex flex-col'>
        <div className='p-6 border-b border-border'>
          <div className='flex items-center gap-2'>
            <div className='w-9 h-9 bg-primary rounded-lg flex items-center justify-center'>
              <span className='text-white text-sm font-bold'>CR</span>
            </div>
            <span className='font-semibold text-text-heading'>Course Portal</span>
          </div>
        </div>

        <nav className='flex-1 p-4 space-y-1'>
          {navLinks.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text hover:bg-bg transition-colors'
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <div className='flex-1 flex flex-col'>
        {/* Header */}
        <header className='bg-surface border-b border-border px-8 py-4 flex items-center justify-between'>
          <div>
            <p className='text-sm text-text-muted'>
              {user?.studentInfo?.level} Level · {user?.studentInfo?.currentSemester} Semester
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <span className='text-sm font-medium text-text-heading'>{user?.fullName}</span>
            <button
              onClick={handleLogout}
              className='flex items-center gap-2 text-sm text-danger hover:underline'
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Page content renders here */}
        <main className='flex-1 p-8'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
