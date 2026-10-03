import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import { LOGO } from '../data.js'
import useAuth from './useAuth.js'
import './admin.css'

function translateError(message = '') {
  const msg = message.toLowerCase()
  if (msg.includes('not confirmed')) return 'E-mail ainda não confirmado. Confirme pelo link enviado para o e-mail ou confirme o usuário no painel do Supabase.'
  if (msg.includes('invalid login')) return 'E-mail ou senha inválidos.'
  if (msg.includes('email')) return 'E-mail inválido.'
  return message || 'Não foi possível entrar.'
}

export default function AdminLogin() {
  const { session, loading, configured } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!configured) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <img src={LOGO} alt="Dcribioshop" />
          <div className="admin-alert info">
            Supabase não configurado. Defina <strong>VITE_SUPABASE_URL</strong> e{' '}
            <strong>VITE_SUPABASE_ANON_KEY</strong> no arquivo <code>.env.local</code>.
          </div>
        </div>
      </div>
    )
  }

  if (loading) return <div className="admin-loading">Carregando…</div>
  if (session) return <Navigate to="/admin/painel" replace />

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (err) {
      setError(translateError(err.message))
      return
    }
    navigate('/admin/painel', { replace: true })
  }

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={submit}>
        <img src={LOGO} alt="Dcribioshop" />
        <label className="admin-field">
          <span>E-mail</span>
          <input
            className="admin-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            autoComplete="username"
            required
          />
        </label>
        <label className="admin-field">
          <span>Senha</span>
          <input
            className="admin-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </label>
        {error && <div className="admin-alert error">{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>
          {busy ? 'Entrando…' : 'Entrar no painel'}
        </button>
      </form>
    </div>
  )
}
