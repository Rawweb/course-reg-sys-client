import { LayoutDashboard, ClipboardCheck, Settings } from 'lucide-react';
import DashboardShell from './DashboardShell';

const navItems = [
  { to: '/lecturer/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/lecturer/registrations', label: 'Pending Approvals', icon: ClipboardCheck },
  { to: '/lecturer/profile', label: 'Profile', icon: Settings },
];

const LecturerLayout = () => <DashboardShell navItems={navItems} roleLabel='Lecturer Portal' />;

export default LecturerLayout;
