import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { logger } from './lib/logger'
import { loadTemplates, logLoadedTemplates } from './lib/templateLoader'

// Enable verbose logging for debugging
logger.setLevel('verbose')
console.log('Current log level:', logger.getLevel())

// Load and log templates
const templateLibrary = loadTemplates()
logLoadedTemplates(templateLibrary)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
