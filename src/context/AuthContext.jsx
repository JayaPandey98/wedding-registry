import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { hasSupabase, supabase } from '../lib/supabase'

const Ctx = createContext({ session: null, user: null, loading: false, signOut: () => {} })
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(hasSupabase)

  useEffect(() => {
    if (!hasSupabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, loading, signOut: () => supabase?.auth.signOut() }),
    [session, loading]
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
