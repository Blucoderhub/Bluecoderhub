import { Component } from 'react';

/**
 * SECURITY — React Error Boundary
 * Catches render errors and shows a user-friendly message.
 * Prevents stack traces from being exposed to users in production.
 */
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorId: null };
    }

    static getDerivedStateFromError() {
        return { hasError: true, errorId: crypto.randomUUID() };
    }

    componentDidCatch(error, errorInfo) {
        // Log to console only — no third-party leak
        // In production, replace with your own logging endpoint (never expose raw errors)
        if (import.meta.env.DEV) {
            console.error('[ErrorBoundary] Caught error:', error, errorInfo);
        } else {
            console.error('[ErrorBoundary] An unexpected error occurred. Error ID:', this.state.errorId);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, errorId: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black flex items-center justify-center px-4">
                    <div className="max-w-md text-center">
                        <div className="text-6xl mb-6">⚠️</div>
                        <h1 className="text-3xl font-display font-bold text-white mb-4">
                            Something went wrong
                        </h1>
                        <p className="text-gray-400 mb-2 leading-relaxed">
                            An unexpected error occurred. Our team has been notified.
                        </p>
                        {import.meta.env.DEV && (
                            <p className="text-xs text-gray-600 font-mono mb-6">
                                Error ID: {this.state.errorId}
                            </p>
                        )}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-6 py-3 rounded-xl text-sm font-bold text-black bg-white hover:bg-gray-200 transition-all outline-none"
                            >
                                ← Go to Homepage
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-300 border border-white/20 hover:bg-white/5 transition-all"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
