import { Link, NavLink } from 'react-router-dom'
import { LOGO } from '../data.js'
import useAuth from './useAuth.js'
import './admin.css'

export default function AdminLayout({ children }) {
  const { session, signOut } = useAuth()

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <div className="admin-wrap admin-topbar-inner">
          <Link to="/admin/painel">
            <img src={LOGO} alt="Dcribioshop" />
          </Link>
          <nav className="admin-nav">
            <NavLink to="/admin/painel" className={({ isActive }) => (isActive ? 'active' : '')}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/produtos" className={({ isActive }) => (isActive ? 'active' : '')}>
              Produtos
            </NavLink>
            <Link to="/" target="_blank" rel="noopener noreferrer">
              Ver site
            </Link>
          </nav>
          <div className="admin-user">
            <span>{session?.user?.email}</span>
            <button className="btn btn-ghost" onClick={signOut}>
              Sair
            </button>
          </div>
        </div>
      </div>
      <div className="admin-wrap">{children}</div>
    </div>
  )
}
