import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SidebarProvider } from './context/SidebarContext'
import { AuthProvider } from './context/AuthContext.tsx'
import { ToastProvider } from './context/ToastContext'
import Toaster from './components/Toaster'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <SidebarProvider>
          <App />
          <Toaster />
        </SidebarProvider>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
)
