import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import MemberPortal from './Portal'

// Catches any render error so the app shows a readable message + reload
// instead of a blank/black screen, and surfaces the actual error.
class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null } }
  static getDerivedStateFromError(err) { return { err } }
  componentDidCatch(err, info) { console.error('App error:', err, info) }
  render() {
    if (!this.state.err) return this.props.children
    const msg = String((this.state.err && (this.state.err.stack || this.state.err.message)) || this.state.err)
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui,Segoe UI,sans-serif', background: '#fdf8ee', color: '#1a1a1a' }}>
      <div style={{ maxWidth: 600, width: '100%', background: '#fff', border: '1px solid #efe6d4', borderRadius: 16, padding: 28, boxShadow: '0 14px 40px rgba(0,0,0,.12)' }}>
        <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>Something went wrong</div>
        <div style={{ fontSize: 13.5, color: '#6b7280', marginBottom: 16 }}>The app hit an unexpected error. Reloading usually fixes it.</div>
        <pre style={{ fontSize: 11.5, color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: 12, borderRadius: 10, overflow: 'auto', whiteSpace: 'pre-wrap', maxHeight: 220, marginBottom: 16 }}>{msg}</pre>
        <button onClick={() => location.reload()} style={{ padding: '11px 20px', borderRadius: 10, background: '#c8102e', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 13 }}>Reload</button>
      </div>
    </div>
  }
}

// Singers open their private link (…/?member=<token>) and get the portal,
// not the manager app.
const memberToken = new URLSearchParams(window.location.search).get('member')
ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>{memberToken ? <MemberPortal token={memberToken} /> : <App />}</ErrorBoundary>
)
