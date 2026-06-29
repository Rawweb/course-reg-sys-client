import { Routes, Route } from 'react-router-dom';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import PublicRoute from './components/router/PublicRoute';
import ProtectedRoute from './components/router/ProtectedRoute';
import RoleRoute from './components/router/RoleRoute';

import StudentLayout from './components/layouts/StudentLayout';
import LecturerLayout from './components/layouts/LecturerLayout';
import AdminLayout from './components/layouts/AdminLayout';

import StudentDashboard from './pages/student/StudentDashboard';
import LecturerDashboard from './pages/lecturer/LecturerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

import Landing from './pages/home/Landing';
import NotFound from './pages/home/NotFound';

import AvailableCourses from './pages/student/AvailableCourses';
import MyRegistration from './pages/student/MyRegistration';
import PendingRegistrations from './pages/lecturer/PendingRegistrations';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminCourses from './pages/admin/AdminCourses';
import AdminUsers from './pages/admin/AdminUsers';
import AdminResults from './pages/admin/AdminResults';
import MyResults from './pages/student/MyResults';
import ProfileSettings from './pages/auth/ProfileSettings';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Landing />} />

      <Route
        path='/login'
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path='/register'
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* student routes — all share StudentLayout via the Outlet pattern */}
      <Route
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole='student'>
              <StudentLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path='/student/dashboard' element={<StudentDashboard />} />
        <Route path='/student/courses' element={<AvailableCourses />} />
        <Route path='/student/registration' element={<MyRegistration />} />
        <Route path='/student/results' element={<MyResults />} />
        <Route path='/student/profile' element={<ProfileSettings />} />
      </Route>

      {/* lecturer routes */}
      <Route
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole='lecturer'>
              <LecturerLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path='/lecturer/dashboard' element={<LecturerDashboard />} />
        <Route path='/lecturer/registrations' element={<PendingRegistrations />} />
        <Route path='/lecturer/profile' element={<ProfileSettings />} />
      </Route>

      {/* admin routes */}
      <Route
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole='admin'>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path='/admin/dashboard' element={<AdminDashboard />} />
        <Route path='/admin/departments' element={<AdminDepartments />} />
        <Route path='/admin/courses' element={<AdminCourses />} />
        <Route path='/admin/users' element={<AdminUsers />} />
        <Route path='/admin/results' element={<AdminResults />} />
        <Route path='/admin/profile' element={<ProfileSettings />} />
      </Route>

      <Route path='*' element={<NotFound />} />
    </Routes>
  );
}

export default App;
