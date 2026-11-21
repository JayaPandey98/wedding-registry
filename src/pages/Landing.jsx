import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Loader2, Plane, Check, Sparkles } from 'lucide-react'
import { hasSupabase, supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { createRegistry, getOwnRegistry, slugAvailable } from '../lib/api'
import { ProgressBar, PageSkeleton } from '../components/ui'
import { UPI_RE, slugify } from '../lib/utils'

function SampleCard() {
  const [raised, setRaised] = useState(18200)
  return (
    <div className="card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-terra text-white"><Plane size={24} /></div>
        <div><p className="font-display text-lg leading-tight">Honeymoon in Europe</p><p className="text-xs text-muted">Try it: tap an amount</p></div>
      </div>
      <ProgressBar raised={raised} target={60000} />
      <div className="mt-3 flex gap-2">
        {[500, 1000, 2500].map((a) => (
          <button key={a} className="chip flex-1 !px-2" onClick={() => setRaised((r) => Math.min(60000, r + a))}>+₹{a.toLocaleString('en-IN')}</button>
        ))}
      </div>
    </div>
  )
}

function SignIn() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState({ busy: false, sent: false, err: '' })
  const redirectTo = window.location.origin + '/'

  const google = () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
  async function magic(e) {
    e.preventDefault()
    setState({ busy: true, sent: false, err: '' })
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo } })
    setState({ busy: false, sent: !error, err: error?.message || '' })
  }

  return (
    <div className="space-y-3">
      <button onClick={google} disabled={!hasSupabase} className="btn btn-ghost w-full !py-3.5">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.7 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.4 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.9-4.7l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/></svg>
        Sign in with Google
      </button>
      <form onSubmit={magic} className="space-y-2">
        <input type="email" required className="field" placeholder="Or use your email for a magic link" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!hasSupabase} />
        <button className="btn btn-soft w-full" disabled={!hasSupabase || state.busy}>
          {state.busy ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />} Email me a sign-in link
        </button>
      </form>
      {state.sent && <p role="status" className="rounded-2xl bg-sage-soft p-3 text-sm text-sage">Check your inbox for the link. You can close this tab.</p>}
      {state.err && <p role="alert" className="rounded-2xl bg-terra-soft p-3 text-sm text-terra-dark">{state.err}</p>}
    </div>
  )
}

function Onboarding({ user }) {
  const nav = useNavigate()
  const [f, setF] = useState({ couple_names: '', slug: '', wedding_date: '', welcome_note: '', upi_id: '' })
  const [slugTouched, setSlugTouched] = useState(false)
  const [avail, setAvail] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  useEffect(() => {
    if (!slugTouched) setF((s) => ({ ...s, slug: slugify(s.couple_names) }))
  }, [f.couple_names, slugTouched])

  useEffect(() => {
    setAvail(null)
    if (f.slug.length < 3) return
    const t = setTimeout(() => slugAvailable(f.slug).then(setAvail).catch(() => setAvail(null)), 400)
    return () => clearTimeout(t)
  }, [f.slug])

  const valid = f.couple_names.trim() && f.slug.length >= 3 && avail !== false && f.wedding_date && UPI_RE.test(f.upi_id.trim())

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      await createRegistry({ ...f, couple_names: f.couple_names.trim(), upi_id: f.upi_id.trim(), owner_id: user.id })
      nav('/dashboard')
    } catch (e2) { setErr(e2.message); setBusy(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <h2 className="font-display text-2xl">Create your registry</h2>
      <p className="text-sm text-muted">Takes about 30 seconds. You can change everything later.</p>
      <input className="field" required placeholder="Couple names, e.g. Aarav & Priya" value={f.couple_names} onChange={set('couple_names')} />
      <div>
        <div className="flex items-center rounded-2xl border border-line bg-cream pl-4 focus-within:border-terra">
          <span className="text-sm text-muted">/w/</span>
          <input className="w-full bg-transparent px-1 py-3 text-[15px] outline-none" required placeholder="aarav-priya" value={f.slug}
            onChange={(e) => { setSlugTouched(true); setF((s) => ({ ...s, slug: slugify(e.target.value) })) }} />
        </div>
        <p className={`mt-1 text-xs ${avail === false ? 'text-terra-dark' : 'text-muted'}`}>
          {f.slug.length < 3 ? 'Your invite link, at least 3 characters.' : avail === null ? 'Checking availability…' : avail ? <span className="inline-flex items-center gap-1 text-sage"><Check size={12} /> Available</span> : 'Already taken. Try adding a year or city.'}
        </p>
      </div>
      <input className="field" required type="date" value={f.wedding_date} onChange={set('wedding_date')} aria-label="Wedding date" />
      <textarea className="field" rows="3" maxLength={500} placeholder="A short welcome note for your guests" value={f.welcome_note} onChange={set('welcome_note')} />
      <div>
        <input className="field" required placeholder="Your UPI ID, e.g. name@okicici" value={f.upi_id} onChange={set('upi_id')} />
        <p className="mt-1 text-xs text-muted">Guests pay you directly. We never touch the money.</p>
      </div>
      {err && <p role="alert" className="rounded-2xl bg-terra-soft p-3 text-sm text-terra-dark">{err}</p>}
      <button className="btn btn-primary w-full !py-4 text-base" disabled={!valid || busy}>{busy ? <Loader2 size={18} className="animate-spin" /> : 'Create registry'}</button>
    </form>
  )
}

function Account() {
  const { user, loading, signOut } = useAuth()
  const nav = useNavigate()
  const [own, setOwn] = useState(undefined)

  useEffect(() => {
    if (!user) return setOwn(undefined)
    getOwnRegistry(user.id).then((r) => (r ? nav('/dashboard', { replace: true }) : setOwn(null))).catch(() => setOwn(null))
  }, [user, nav])

  if (loading) return <div className="h-40 animate-pulse rounded-3xl bg-line/70" />
  if (!user) return <SignIn />
  if (own === undefined) return <div className="h-40 animate-pulse rounded-3xl bg-line/70" />
  return (
    <div className="space-y-4">
      <Onboarding user={user} />
      <button onClick={signOut} className="w-full text-center text-sm text-muted underline">Sign out ({user.email})</button>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="space-y-8 p-6 pb-12 pt-10">
      <div className="space-y-4">
        <h1 className="font-display text-[2.6rem] leading-[1.05]">Skip the dinner sets. Crowdfund memories that last.</h1>
        <p className="text-[17px] text-muted">List the honeymoon, the guitar, the espresso machine. Guests chip in any amount over UPI and leave a wish with it.</p>
      </div>
      <SampleCard />
      <Link to="/demo" className="btn btn-sage w-full !py-4 text-base"><Sparkles size={18} /> Try the live demo</Link>
      <section className="border-t border-line pt-6">
        {hasSupabase ? <Account /> : (
          <p className="rounded-2xl bg-terra-soft p-4 text-sm text-terra-dark">Sign-in is off because Supabase isn’t configured yet. Add your keys to <code>.env</code> (see README) or explore the demo.</p>
        )}
      </section>
    </div>
  )
}
