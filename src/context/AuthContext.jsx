import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login, logout, signup, getSession, loginAs, ROLE_HOME_MAP } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session) setUser(session.user);
    setLoading(false);
  }, []);

  const handleLogin = useCallback(async (credentials) => {
    const { user: u } = await login(credentials);
    setUser(u);
    return u;
  }, []);

  const handleSignup = useCallback(async (data) => {
    const { user: u } = await signup(data);
    setUser(u);
    return u;
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
  }, []);

  const handleLoginAs = useCallback(async (role) => {
    const { user: u } = await loginAs(role);
    setUser(u);
    return u;
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading,
      isAuthenticated: !!user,
      role: user?.role,
      isSuperAdmin: user?.role === 'superadmin',
      isAdmin:      user?.role === 'admin',
      isDoctor:     user?.role === 'doctor',
      isStaff:      user?.role === 'staff',
      isPharmacist: user?.role === 'pharmacist',
      isPatient:    user?.role === 'patient',
      login:     handleLogin,
      signup:    handleSignup,
      logout:    handleLogout,
      loginAs:   handleLoginAs,
      // kept for backward compat
      demoLogin: handleLoginAs,
      ROLE_HOME_MAP,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
