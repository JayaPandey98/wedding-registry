import { useState } from 'react'
import { Heart, Pencil, Trash2 } from 'lucide-react'
import { GiftThumb, ProgressBar } from './ui'
import { fmtINR, timeAgo } from '../lib/utils'

export default function GiftCard({ item, contribs, mode, onContribute, onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const done = item.raised_amount >= item.target_amount
  return (
    <article className="card overflow-hidden">
      <div className="relative">
        <GiftThumb item={item} className="h-36" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-ink">{item.category}</span>
        {done && <span className="absolute right-3 top-3 rounded-full bg-sage px-3 py-1 text-xs font-bold text-white">Fully funded</span>}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="font-display text-xl leading-snug">{item.title}</h3>
          {item.note && <p className="mt-1 text-sm text-muted">{item.note}</p>}
        </div>
        <ProgressBar raised={item.raised_amount} target={item.target_amount} />
        <div className="flex items-center justify-between gap-2">
          <button onClick={() => setOpen(!open)} aria-expanded={open} className="inline-flex items-center gap-1.5 text-sm font-semibold text-sage">
            <Heart size={16} /> {open ? 'Hide wishes' : `View wishes (${contribs.length})`}
          </button>
          {mode === 'guest' ? (
            <button className="btn btn-primary" disabled={done} onClick={onContribute}>{done ? 'Funded' : 'Contribute'}</button>
          ) : (
            <div className="flex gap-2">
              <button className="btn btn-soft !px-3" onClick={onEdit} aria-label={`Edit ${item.title}`}><Pencil size={16} /></button>
              <button className="btn btn-soft !px-3" onClick={onDelete} aria-label={`Delete ${item.title}`}><Trash2 size={16} /></button>
            </div>
          )}
        </div>
        {open && (
          <ul className="space-y-2">
            {contribs.length === 0 && <li className="rounded-2xl bg-cream p-3 text-sm text-muted">No wishes yet. Be the first to leave one.</li>}
            {contribs.map((c) => (
              <li key={c.id} className="flex gap-3 rounded-2xl bg-cream p-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sage-soft font-bold text-sage">{c.is_anonymous ? '♡' : c.guest_name[0]}</div>
                <div className="min-w-0 text-sm">
                  <p><b>{c.guest_name}</b> · {fmtINR(c.amount)} <span className="text-muted">· {timeAgo(c.created_at)}</span></p>
                  {c.message && <p className="text-muted">“{c.message}”</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
