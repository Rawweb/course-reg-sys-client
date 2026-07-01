import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DashboardShell = ({ navItems, roleLabel }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const sidebarContent = (
    <div className='flex h-full flex-col'>
      {/* Brand */}
      <div className='flex items-center gap-2 px-6 py-5 border-b border-white/10'>
        <GraduationCap className='text-secondary' size={26} />
        <div>
          <p className='text-sm font-bold text-white leading-tight'>Course Reg</p>
          <p className='text-[11px] text-white/50'>{roleLabel}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className='flex-1 space-y-1 px-3 py-4 overflow-y-auto'>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout pinned to the bottom */}
      <div className='border-t border-white/10 p-3'>
        <button
          onClick={handleLogout}
          className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm
                     font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors'
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-bg'>
      {/* ===== DESKTOP SIDEBAR: fixed, hidden below lg ===== */}
      <aside className='hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-slate-900'>
        {sidebarContent}
      </aside>

      {/* ===== MOBILE DRAWER: slides in, only when open ===== */}
      {mobileOpen && (
        <div className='lg:hidden'>
          {/* Dark overlay behind the drawer; tapping it closes the drawer. */}
          <div className='fixed inset-0 z-40 bg-black/50' onClick={() => setMobileOpen(false)} />
          {/* The drawer itself */}
          <aside className='fixed inset-y-0 left-0 z-50 w-64 bg-slate-900'>
            <button
              onClick={() => setMobileOpen(false)}
              className='absolute right-3 top-4 text-white/70 hover:text-white'
            >
              <X size={22} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ===== MAIN AREA: offset by sidebar width on desktop ===== */}
      <div className='lg:pl-64'>
        {/* Topbar */}
        <header
          className='sticky top-0 z-30 flex h-16 items-center justify-between
                           border-b border-border bg-primary px-4 lg:px-8'
        >
          {/* Hamburger — only on mobile */}
          <button onClick={() => setMobileOpen(true)} className='lg:hidden text-white'>
            <Menu size={24} />
          </button>

          {/* Spacer on desktop (keeps user info pushed right) */}
          <div className='hidden lg:block' />

          {/* User info, top-right */}
          <div className='flex items-center gap-3'>
            <div className='text-right'>
              <p className='text-sm font-medium text-white leading-tight'>{user?.name}</p>
              <p className='text-[11px] text-white/70 capitalize'>{user?.role}</p>
            </div>
            {/* Simple avatar circle with initials */}
            <div
              className='flex h-9 w-9 items-center justify-center rounded-full
                            bg-white/20 text-sm font-semibold text-white'
            >
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        {/* The page content renders here via Outlet */}
        <main className='p-4 lg:p-8'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
