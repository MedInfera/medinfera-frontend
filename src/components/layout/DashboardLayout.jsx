import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ErrorBoundary from '../common/ErrorBoundary';

export default function DashboardLayout({ navGroups, title, subtitle, children }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar navGroups={navGroups} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
