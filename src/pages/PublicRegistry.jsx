import { Navigate, useParams } from 'react-router-dom'
import { hasSupabase } from '../lib/supabase'
import { useSupabaseStore } from '../hooks/useRegistryStore'
import { ErrorState, PageSkeleton } from '../components/ui'
import { GuestView } from '../components/Views'
import NotFound from './NotFound'

function Live({ slug }) {
  const store = useSupabaseStore({ slug })
  if (store.loading) return <PageSkeleton />
  if (store.error) return <ErrorState message={store.error} onRetry={store.reload} />
  if (!store.registry) return <NotFound message={`There is no registry at /w/${slug}.`} />
  return <GuestView store={store} />
}

export default function PublicRegistry() {
  const { slug } = useParams()
  if (!hasSupabase) return <Navigate to="/demo" replace />
  return <Live key={slug} slug={slug} />
}
