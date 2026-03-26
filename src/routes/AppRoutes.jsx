import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Landing           from '../pages/landing/Landing';
import Login             from '../pages/auth/Login';
import Signup            from '../pages/auth/Signup';
import AdminDashboard    from '../dashboards/adminDashboard/AdminDashboard';
import DoctorDashboard   from '../dashboards/doctorDashboard/DoctorDashboard';
import PatientDashboard  from '../dashboards/patientDashboard/PatientDashboard';
import StaffDashboard    from '../dashboards/staffDashboard/StaffDashboard';
import PharmacistDashboard from '../dashboards/pharmacistDashboard/PharmacistDashboard';
import SuperAdminDashboard from '../dashboards/superAdminDashboard/SuperAdminDashboard';

const ROLE_HOME = {
  superadmin: '/superadmin',
  admin:      '/admin',
  doctor:     '/doctor',
  staff:      '/staff',
  pharmacist: '/pharmacist',
  patient:    '/patient',
};

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
        <span className="text-sm text-slate-400">Loading…</span>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  return <Landing />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/"        element={<RootRedirect />} />
      <Route path="/login"   element={<PublicRoute><Login  /></PublicRoute>} />
      <Route path="/signup"  element={<PublicRoute><Signup /></PublicRoute>} />

      <Route path="/superadmin/*" element={
        <ProtectedRoute allowedRoles={['superadmin']}>
          <SuperAdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/*"      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/doctor/*"     element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/staff/*"      element={
        <ProtectedRoute allowedRoles={['staff']}>
          <StaffDashboard />
        </ProtectedRoute>
      } />
      <Route path="/pharmacist/*" element={
        <ProtectedRoute allowedRoles={['pharmacist']}>
          <PharmacistDashboard />
        </ProtectedRoute>
      } />
      <Route path="/patient/*"    element={
        <ProtectedRoute allowedRoles={['patient']}>
          <PatientDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
