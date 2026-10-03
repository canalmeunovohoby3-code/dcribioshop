import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

export default function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session || null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    // Marca este dispositivo como "admin" para não contar as visitas do próprio
    // administrador nas métricas do site.
    try {
      if (session) localStorage.setItem('dcribioshop-admin', '1')
    } catch {
      /* ignore */
    }
  }, [session])

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
  }

  return { session, loading, configured: isSupabaseConfigured, signOut }
}
