import { LayoutDashboard, FileBarChart, Settings } from 'lucide-react';
import DashboardShell from './DashboardShell';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
  { to: '/admin/profile', label: 'Profile', icon: Settings },
];

const AdminLayout = () => <DashboardShell navItems={navItems} roleLabel='Admin Portal' />;

export default AdminLayout;
