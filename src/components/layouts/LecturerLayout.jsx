import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, ClipboardCheck, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LiveDateTime from '../LiveDateTime';
import Avatar from '../Avatar';

const LecturerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/lecturer/dashboard', icon: LayoutDashboard },
    { label: 'Pending Registrations', path: '/lecturer/registrations', icon: ClipboardCheck },
    { label: 'Profile Settings', path: '/lecturer/profile', icon: Settings },
  ];

  return (
    <div className='flex min-h-screen bg-bg'>
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

        <div className='p-4 border-t border-border'>
          <button
            onClick={handleLogout}
            className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-red-50 transition-colors w-full'
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className='flex-1 flex flex-col'>
        <header className='bg-surface border-b border-border px-8 py-4 flex items-center justify-between'>
          <div>
            <p className='text-sm text-text-muted'>Lecturer Panel</p>
          </div>
          <div className='flex items-center gap-4'>
            <LiveDateTime />
            <Avatar name={user?.fullName} />
          </div>
        </header>

        <main className='flex-1 p-8'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LecturerLayout;
