import { LayoutDashboard, BookOpen, ClipboardList, GraduationCap, Settings } from 'lucide-react';
import DashboardShell from './DashboardShell';

const navItems = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student/courses', label: 'Available Courses', icon: BookOpen },
  { to: '/student/registration', label: 'My Registration', icon: ClipboardList },
  { to: '/student/results', label: 'My Results', icon: GraduationCap },
  { to: '/student/profile', label: 'Profile', icon: Settings },
];

const StudentLayout = () => <DashboardShell navItems={navItems} roleLabel='Student Portal' />;

export default StudentLayout;
