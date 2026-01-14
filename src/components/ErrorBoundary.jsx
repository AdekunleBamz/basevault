import { Component } from 'react';
import { motion } from 'framer-motion';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base-darker flex items-center justify-center p-4">
          <motion.div
            className="max-w-md w-full p-8 rounded-2xl bg-base-card border border-base-border text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-gray-400 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 rounded-xl bg-base-dark text-left overflow-auto max-h-40">
                <p className="text-sm text-red-400 font-mono">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            
            <motion.button
              onClick={this.handleReset}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-base-blue to-base-accent font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Refresh Page
            </motion.button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
