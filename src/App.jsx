import { Routes, Route, Navigate } from 'react-router-dom';
import PublicRoute from './components/router/PublicRoute';
import Login from './pages/auth/Login';

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

      <Route path='*' element={<Navigate to='/login' replace />} />
    </Routes>
  );
}

export default App;
