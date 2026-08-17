import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('merbolo_guest_cart');
    } catch (e) {}
    this.setState({ hasError: false });
    window.location.href = '/shop';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-brand-50">
          <div className="bg-white p-8 rounded-3xl border border-brand-100 shadow-sm max-w-md space-y-4">
            <h2 className="text-xl font-bold text-slate-800 font-serif">Oops! Cart Data Reset Needed</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your browser saved cached cart data from an earlier version. Click below to clear the stale cache and view your shop.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full bg-brand-700 text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors shadow-sm"
            >
              Reset Cart Cache & Browse Shop
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
