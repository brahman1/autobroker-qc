import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './index.css'
import { TranslationProvider } from './i18n.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <TranslationProvider><App /></TranslationProvider>
      <Toaster position="top-right" />
    </BrowserRouter>
  </React.StrictMode>,
)
