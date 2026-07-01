// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicRoute from './components/router/PublicRoute';
import ProtectedRoute from './components/router/ProtectedRoute';
import RoleRoute from './components/router/RoleRoute';

import Login from './pages/auth/Login';

import StudentLayout from './components/layouts/StudentLayout';
import LecturerLayout from './components/layouts/LecturerLayout';
import AdminLayout from './components/layouts/AdminLayout';

import StudentDashboard from './pages/student/StudentDashboard';
import LecturerDashboard from './pages/lecturer/LecturerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AvailableCourses from './pages/student/AvailableCourses';
import MyRegistration from './pages/student/MyRegistration';
import MyResults from './pages/student/MyResults';
import ProfileSettings from './pages/auth/ProfileSettings';
import PendingRegistrations from './pages/lecturer/PendingRegistrations';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Navigate to='/login' replace />} />

      <Route
        path='/login'
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* STUDENT */}
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

      {/* LECTURER */}
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

      {/* ADMIN */}
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
        <Route path='/admin/profile' element={<ProfileSettings />} />
      </Route>

      <Route path='*' element={<Navigate to='/login' replace />} />
    </Routes>
  );
}

export default App;
