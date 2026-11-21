import { Navigate } from 'react-router-dom'
import { hasSupabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useSupabaseStore } from '../hooks/useRegistryStore'
import { ErrorState, PageSkeleton } from '../components/ui'
import { CoupleView } from '../components/Views'

function Inner({ user, signOut }) {
  const store = useSupabaseStore({ ownerId: user.id })
  if (store.loading) return <PageSkeleton />
  if (store.error) return <ErrorState message={store.error} onRetry={store.reload} />
  if (!store.registry) return <Navigate to="/" replace />
  const path = `/w/${store.registry.slug}`
  return <CoupleView store={store} link={window.location.origin + path} publicPath={path} onSignOut={signOut} />
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  if (!hasSupabase) return <Navigate to="/demo" replace />
  if (loading) return <PageSkeleton />
  if (!user) return <Navigate to="/" replace />
  return <Inner user={user} signOut={signOut} />
}
