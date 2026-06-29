import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LiveDateTime from '../LiveDateTime';
import Avatar from '../Avatar';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Tracks whether the mobile sidebar drawer is open.
  // Irrelevant on desktop screens, where the sidebar is always visible.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Available Courses', path: '/student/courses', icon: BookOpen },
    { label: 'My Registration', path: '/student/registration', icon: ClipboardList },
    { label: 'My Results', path: '/student/results', icon: GraduationCap },
    { label: 'Profile Settings', path: '/student/profile', icon: Settings },
  ];

  // Closes the mobile drawer automatically whenever a link is clicked —
  // without this, navigating to a new page would leave the drawer open,
  // covering the new page's content
  const handleNavClick = () => setMobileMenuOpen(false);

  return (
    // h-screen + overflow-hidden on the OUTER container is what stops
    // the whole page (sidebar included) from scrolling as one unit
    <div className='flex h-screen bg-bg overflow-hidden'>
      {/* Mobile backdrop — only rendered when the drawer is open,
          clicking it closes the drawer (tapping outside to dismiss) */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className='fixed inset-0 bg-black/40 z-40 lg:hidden'
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-surface border-r border-border
          flex flex-col z-50 transition-transform duration-200
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className='p-6 border-b border-border flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='w-9 h-9 bg-primary rounded-lg flex items-center justify-center'>
              <span className='text-white text-sm font-bold'>CR</span>
            </div>
            <span className='font-semibold text-text-heading'>Course Portal</span>
          </div>
          {/* Close button — only relevant/visible on mobile, inside the open drawer */}
          <button onClick={() => setMobileMenuOpen(false)} className='lg:hidden text-text-muted'>
            <X size={20} />
          </button>
        </div>

        {/* overflow-y-auto here means IF the nav list itself is ever
            too long for the screen, only THIS scrolls, not the header/footer */}
        <nav className='flex-1 p-4 space-y-1 overflow-y-auto'>
          {navLinks.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-primary/10 text-primary' : 'text-text hover:bg-bg'}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
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

      {/* Main content area */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Header */}
        <header className='bg-surface border-b border-border px-4 sm:px-8 py-4 flex items-center justify-between flex-shrink-0'>
          <div className='flex items-center gap-3'>
            {/* Hamburger button — only visible below the lg breakpoint */}
            <button onClick={() => setMobileMenuOpen(true)} className='lg:hidden text-text-muted'>
              <Menu size={22} />
            </button>
            <p className='text-sm text-text-muted'>
              {user?.studentInfo?.level} Level · {user?.studentInfo?.currentSemester} Semester
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <LiveDateTime />
            <Avatar name={user?.fullName} />
          </div>
        </header>

        {/* THIS is the only element that actually scrolls —
            overflow-y-auto here, combined with overflow-hidden on its
            parent and the outermost container, contains scrolling to
            just the page content, leaving sidebar and header fixed */}
        <main className='flex-1 overflow-y-auto p-4 sm:p-8'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
