import React from 'react'

type ErrorBoundaryState = { hasError: boolean; error?: any }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('UI error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg w-full glass-card p-6">
            <h1 className="text-2xl font-bold text-danger mb-2">Something went wrong</h1>
            <p className="text-gray-700 mb-4">An error occurred while rendering this page.</p>
            <pre className="text-xs p-3 bg-gray-100 rounded overflow-auto max-h-64">
              {String(this.state.error)}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children as any
  }
}
