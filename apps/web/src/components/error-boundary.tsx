'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch JavaScript errors in child components.
 * Prevents the entire app from crashing and shows a user-friendly error message.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // TODO: Send to error tracking service (e.g., Sentry)
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 rounded-lg bg-danger/10 border border-danger/30">
          <AlertTriangle className="w-12 h-12 text-danger mb-4" />
          <h2 className="text-lg font-semibold text-danger mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-danger text-center mb-4 max-w-md">
            An error occurred while rendering this component. Please try refreshing the page.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="text-xs bg-danger/10 p-2 rounded overflow-auto max-w-full mb-4">
              {this.state.error.message}
            </pre>
          )}
          <Button variant="destructive" onClick={this.handleRetry}>
            <RefreshCw />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
