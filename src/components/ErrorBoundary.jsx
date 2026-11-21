import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 bg-cream p-8 text-center">
        <h1 className="font-display text-2xl">Something broke on this page</h1>
        <p className="text-sm text-muted">Reload to try again. If it keeps happening, your registry data is safe.</p>
        <button className="btn btn-primary" onClick={() => location.reload()}>Reload page</button>
      </div>
    )
  }
}
