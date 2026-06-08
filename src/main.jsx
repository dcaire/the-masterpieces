import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import MemberPortal from './Portal'

// Singers open their private link (…/?member=<token>) and get the portal,
// not the manager app.
const memberToken = new URLSearchParams(window.location.search).get('member')
ReactDOM.createRoot(document.getElementById('root')).render(
  memberToken ? <MemberPortal token={memberToken} /> : <App />
)
