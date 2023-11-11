import React, { ReactNode, PropsWithChildren } from 'react';

type Props = PropsWithChildren<{ fallback: ReactNode }>;

class ErrorBoundary extends React.Component<Props> {
  state: {
    hasError: boolean;
    errorMessage: string | null;
    componentStack: string | null;
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: null,
      componentStack: 'null',
    };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: ReferenceError, info: { componentStack: string }) {
    this.setState((prevState) => ({
      ...prevState,
      errorMessage: error.message,
      componentStack: info.componentStack,
    }));

    if (import.meta.env.DEV) {
      console.error('🚀 ~ ErrorBoundary, error message:', error.message);
      console.error('ErrorBoundary, componentStack:', info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            color: 'white',
            background: 'gray',
            margin: '14px',
            padding: '14px',
            borderRadius: '8px',
          }}
        >
          {this.props.fallback}

          {import.meta.env.DEV && (
            <>
              <p style={{ color: 'darkred' }}>{this.state.errorMessage}</p>
              <code style={{ whiteSpace: 'pre-wrap' }}>
                {this.state.componentStack}
              </code>
            </>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
