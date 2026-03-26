import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';
import './styles/globals.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
