import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useDemoStore } from '../hooks/useRegistryStore'
import { CoupleView, GuestView } from '../components/Views'

// Runs entirely on local state: no Supabase, no login. Resets on refresh.
export default function Demo() {
  const store = useDemoStore()
  const [role, setRole] = useState('guest')
  return (
    <div>
      <div className="sticky top-0 z-30 bg-ink text-cream">
        <div className="mx-auto max-w-6xl space-y-2 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold"><ArrowLeft size={16} /> Home</Link>
            <span className="text-xs text-cream/70">Demo mode · changes reset on refresh</span>
          </div>
          <div role="tablist" className="flex max-w-md rounded-full bg-white/10 p-1 sm:max-w-sm">
            {[['guest', 'Guest View'], ['couple', 'Couple View']].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={role === k} onClick={() => setRole(k)}
                className={`flex-1 rounded-full py-2 text-sm font-bold transition ${role === k ? 'bg-terra text-white' : 'text-cream/70'}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      {role === 'guest'
        ? <GuestView store={store} />
        : <CoupleView store={store} link={window.location.origin + '/demo'} />}
    </div>
  )
}
