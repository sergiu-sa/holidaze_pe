import './styles/global.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'

if (import.meta.env.DEV) {
  void import('@axe-core/react').then(async ({ default: axe }) => {
    const React = await import('react')
    const ReactDOM = await import('react-dom')
    void axe(React, ReactDOM, 1000)
  })
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root missing from index.html')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
