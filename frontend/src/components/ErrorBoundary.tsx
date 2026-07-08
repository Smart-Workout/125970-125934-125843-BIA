import { AlertCircle, RefreshCw } from 'lucide-react'
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  title?: string
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', this.props.title ?? 'panel', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="panel">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <AlertCircle size={16} style={{ color: '#b91c1c', flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', fontWeight: 780, color: '#b91c1c', fontSize: 13 }}>
                {this.props.title ? `${this.props.title} couldn't render` : "This panel couldn't render"}
              </p>
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                {this.state.error?.message ?? 'An unexpected error occurred.'}
              </p>
            </div>
            <button
              className="icon-button"
              type="button"
              style={{ flexShrink: 0 }}
              onClick={() => this.setState({ hasError: false })}
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </div>
        </section>
      )
    }
    return this.props.children
  }
}
