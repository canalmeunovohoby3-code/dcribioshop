import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ProductsProvider } from './lib/products.jsx'
import { trackPageView } from './lib/metrics.js'
import SplashScreen from './components/SplashScreen.jsx'
import Home from './pages/Home.jsx'
import QuemSomos from './pages/QuemSomos.jsx'
import Projetos from './pages/Projetos.jsx'
import Produto from './pages/Produto.jsx'
import AdminLogin from './admin/AdminLogin.jsx'
import RequireAdmin from './admin/RequireAdmin.jsx'
import Dashboard from './admin/Dashboard.jsx'
import ProductList from './admin/ProductList.jsx'
import ProductEditor from './admin/ProductEditor.jsx'

function Shell() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  // A splash é uma introdução do site público: aparece uma vez e não no painel admin.
  const [splashEnabled] = useState(
    () => typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin'),
  )
  const [revealed, setRevealed] = useState(!splashEnabled)

  useEffect(() => {
    const fallback = window.setTimeout(() => setRevealed(true), 6000)
    return () => window.clearTimeout(fallback)
  }, [])

  useEffect(() => {
    if (!isAdmin) trackPageView(location.pathname)
  }, [location.pathname, isAdmin])

  const ready = revealed || isAdmin

  return (
    <>
      {splashEnabled && <SplashScreen onReveal={() => setRevealed(true)} />}
      <div className={`app-shell${ready ? ' app-shell--ready' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quem-somos" element={<QuemSomos />} />
          <Route path="/projetos" element={<Projetos />} />
          <Route path="/produto/:slug" element={<Produto />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/painel"
            element={
              <RequireAdmin>
                <Dashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/produtos"
            element={
              <RequireAdmin>
                <ProductList />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/produtos/novo"
            element={
              <RequireAdmin>
                <ProductEditor />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/produtos/:id"
            element={
              <RequireAdmin>
                <ProductEditor />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  )
}

export default function App() {
  return (
    <ProductsProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </ProductsProvider>
  )
}
