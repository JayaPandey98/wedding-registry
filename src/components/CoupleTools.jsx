import { useState } from 'react'
import { CreditCard, Check, Copy, MessageCircle, Share2, BadgeCheck, Trash2, Loader2 } from 'lucide-react'
import { ANON, UPI_RE, copyText, fmtINR, timeAgo } from '../lib/utils'
import { EmptyState } from './ui'
import { useToast } from './Toast'

export function UpiBanner({ upi, onSave }) {
  const [edit, setEdit] = useState(false)
  const [v, setV] = useState(upi)
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const valid = UPI_RE.test(v.trim())

  async function save() {
    setBusy(true)
    try { await onSave({ upi_id: v.trim() }); toast('UPI ID saved'); setEdit(false) }
    catch (e) { toast(e.message, { tone: 'error' }) }
    setBusy(false)
  }

  if (!edit)
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-sage-soft px-4 py-3">
        <CreditCard size={20} className="text-sage" />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-bold">UPI Payment Settings</p>
          <p className="truncate text-muted">Linked: {upi}</p>
        </div>
        <button className="btn btn-ghost !px-4 !py-2" onClick={() => { setV(upi); setEdit(true) }}>Edit</button>
      </div>
    )
  return (
    <div className="space-y-2 rounded-2xl bg-sage-soft p-4">
      <p className="text-sm font-bold">Update your UPI ID</p>
      <input className="field" autoFocus value={v} onChange={(e) => setV(e.target.value)} placeholder="name@okicici" />
      {!valid && <p className="text-xs text-terra-dark">Use the format name@bank, for example aarav@okicici.</p>}
      <div className="flex gap-2">
        <button className="btn btn-primary !py-2" disabled={!valid || busy} onClick={save}>{busy ? <Loader2 size={16} className="animate-spin" /> : 'Save UPI ID'}</button>
        <button className="btn btn-ghost !py-2" onClick={() => setEdit(false)}>Cancel</button>
      </div>
    </div>
  )
}

export function ShareCard({ link, names }) {
  const [copied, setCopied] = useState(false)
  const wa = `https://wa.me/?text=${encodeURIComponent(`Join us in celebrating ${names}! Leave a wish or contribute to our wedding registry: ${link}`)}`
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-2"><Share2 size={18} className="text-terra" /><h2 className="font-display text-lg">Invite your guests</h2></div>
      <p className="mb-3 truncate rounded-xl bg-cream px-3 py-2 text-sm text-muted">{link}</p>
      <div className="flex gap-2">
        <button className="btn btn-soft flex-1" onClick={async () => { await copyText(link); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
          {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Invite Link</>}
        </button>
        <a className="btn btn-sage flex-1" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Share on WhatsApp</a>
      </div>
    </div>
  )
}

export function ReconcileFeed({ contribs, items, onVerify, onRemove }) {
  const [pendingOnly, setPendingOnly] = useState(false)
  const title = (id) => items.find((i) => i.id === id)?.title || 'Gift'
  const pending = contribs.filter((c) => !c.is_verified).length
  const list = pendingOnly ? contribs.filter((c) => !c.is_verified) : contribs
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">Contributions &amp; wishes</h2>
        <button className={`chip ${pendingOnly ? 'chip-on' : ''}`} onClick={() => setPendingOnly(!pendingOnly)}>Unverified ({pending})</button>
      </div>
      <p className="text-sm text-muted">Check each payment in your UPI app, then mark it verified. Remove entries where no money arrived.</p>
      {list.length === 0 && <EmptyState title={pendingOnly ? 'Nothing to verify' : 'No contributions yet'}>{pendingOnly ? 'Every contribution has been verified.' : 'Share your invite link to start receiving wishes.'}</EmptyState>}
      {list.map((c) => (
        <div key={c.id} className="card space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold">{c.guest_name || ANON} <span className="font-normal text-muted">gave {fmtINR(c.amount)}</span></p>
              <p className="text-xs text-muted">{title(c.item_id)} · {timeAgo(c.created_at)}</p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${c.is_verified ? 'bg-sage-soft text-sage' : 'bg-terra-soft text-terra-dark'}`}>{c.is_verified ? 'Verified' : 'Unverified'}</span>
          </div>
          {c.message && <p className="rounded-xl bg-cream p-3 text-sm text-muted">“{c.message}”</p>}
          <div className="flex gap-2">
            <button className="btn btn-ghost flex-1 !py-2" onClick={() => onVerify(c.id, !c.is_verified)}><BadgeCheck size={16} /> {c.is_verified ? 'Unmark' : 'Mark Verified'}</button>
            <button className="btn btn-soft !py-2" onClick={() => window.confirm('Remove this contribution? The gift total will go down.') && onRemove(c.id)}><Trash2 size={16} /> Remove</button>
          </div>
        </div>
      ))}
    </section>
  )
}
