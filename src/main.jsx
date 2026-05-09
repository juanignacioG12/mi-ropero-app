import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#f0ede8',
            border: '0.5px solid rgba(212,168,83,0.4)',
            borderRadius: '100px',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#d4a853', secondary: '#1a1000' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)