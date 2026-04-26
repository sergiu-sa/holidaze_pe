import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

// RouteErrorBoundary — catches render errors per Outlet so a thrown page
// doesn't take down the topbar + footer. Class component because React 18
// has no hook-based error boundary.
export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[RouteErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state

    if (error) {
      return (
        <div
          role="alert"
          className="flex flex-col items-start gap-6 px-gutter py-shelf"
        >
          <p className="font-mono text-step--2 uppercase tracking-runhead text-cinnabar">
            Error
          </p>
          <h1 className="font-serif text-step-4 text-ink leading-none tracking-tight">
            Something came{' '}
            <em className="italic text-cinnabar">loose.</em>
          </h1>
          <p className="font-sans text-step-0 text-ink-soft max-w-prose">
            A render error occurred on this page. The rest of the site is
            unaffected. You can try reloading, or return to the home page.
          </p>
          <div className="flex gap-4 flex-wrap">
            <button
              type="button"
              onClick={this.handleReset}
              className="
                font-mono text-step--2 uppercase tracking-eyebrow
                px-5 py-3 min-h-[44px]
                bg-cinnabar text-ivory
                border border-cinnabar
                transition-colors duration-fast ease-out-quint
                hover:bg-cinnabar-deep hover:border-cinnabar-deep
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar focus-visible:ring-offset-2
              "
            >
              Try again
            </button>
            <a
              href="/"
              className="
                font-mono text-step--2 uppercase tracking-eyebrow
                px-5 py-3 min-h-[44px] inline-flex items-center
                border border-ink text-ink
                transition-colors duration-fast ease-out-quint
                hover:bg-ink hover:text-ivory
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar focus-visible:ring-offset-2
              "
            >
              Return home
            </a>
          </div>
          {import.meta.env.DEV && (
            <details className="mt-4 w-full">
              <summary className="font-mono text-step--2 uppercase tracking-runhead text-ink-mute cursor-pointer">
                Error detail
              </summary>
              <pre className="mt-2 font-mono text-[0.72rem] text-ink-mute overflow-x-auto whitespace-pre-wrap">
                {error.message}
                {'\n'}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
