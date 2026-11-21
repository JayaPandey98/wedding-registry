import { Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import PublicRegistry from './pages/PublicRegistry'
import Demo from './pages/Demo'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <div className="mx-auto min-h-screen w-full max-w-md bg-cream md:my-5 md:min-h-[calc(100vh-2.5rem)] md:rounded-[2.5rem] md:border md:border-line md:shadow-2xl">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/w/:slug" element={<PublicRegistry />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
