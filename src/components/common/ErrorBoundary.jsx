import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('ErrorBoundary:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-slate-800">Something went wrong</h2>
          <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })} className="btn-primary btn-sm">Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
