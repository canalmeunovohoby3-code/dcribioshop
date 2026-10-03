import { Navigate, useLocation } from 'react-router-dom'
import useAuth from './useAuth.js'
import AdminLayout from './AdminLayout.jsx'
import './admin.css'

export default function RequireAdmin({ children }) {
  const { session, loading, configured } = useAuth()
  const location = useLocation()

  if (!configured) {
    return (
      <div className="admin-shell">
        <div className="admin-wrap" style={{ paddingTop: 40 }}>
          <div className="admin-alert info">
            Supabase não configurado. Defina <strong>VITE_SUPABASE_URL</strong> e{' '}
            <strong>VITE_SUPABASE_ANON_KEY</strong>.
          </div>
        </div>
      </div>
    )
  }

  if (loading) return <div className="admin-loading">Carregando…</div>
  if (!session) return <Navigate to="/admin" state={{ from: location.pathname }} replace />

  return <AdminLayout>{children}</AdminLayout>
}
