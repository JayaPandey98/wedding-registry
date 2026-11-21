import { useEffect, useState } from 'react'
import { X, AlertTriangle, Gift } from 'lucide-react'
import { ICONS } from '../lib/icons'
import { CAT_BG, fmtINR, pct } from '../lib/utils'

export function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div onClick={onClose} className="absolute inset-0 animate-fade bg-ink/50" />
      <div role="dialog" aria-modal="true" aria-label={title}
        className="relative max-h-[92vh] w-full max-w-md animate-sheet overflow-y-auto rounded-t-[2rem] bg-white px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full bg-cream"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ProgressBar({ raised, target }) {
  const p = pct(raised, target)
  return (
    <div>
      <div role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100} className="h-2.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-sage transition-[width] duration-700" style={{ width: p + '%' }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[13px] text-muted">
        <span><b className="text-ink">{fmtINR(raised)}</b> of {fmtINR(target)} funded</span>
        <span>{p}%</span>
      </div>
    </div>
  )
}

export function GiftThumb({ item, className = '' }) {
  const [bad, setBad] = useState(false)
  if (item.image_url && !bad)
    return <img src={item.image_url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)} className={`w-full object-cover ${className}`} />
  const Icon = ICONS[item.icon_name] || Gift
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ background: CAT_BG[item.category] }}>
      <Icon size={52} strokeWidth={1.5} className="text-white drop-shadow" />
    </div>
  )
}

export function Skeleton({ className = '' }) { return <div className={`animate-pulse rounded-3xl bg-line/70 ${className}`} /> }

export function PageSkeleton() {
  return (
    <div className="space-y-4 p-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-12" /><Skeleton className="h-40" /><Skeleton className="h-64" /><Skeleton className="h-64" />
    </div>
  )
}

export function EmptyState({ icon: Icon = Gift, title, children }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-white/60 p-8 text-center">
      <Icon className="mx-auto mb-3 text-terra" size={30} />
      <p className="font-display text-lg">{title}</p>
      {children && <p className="mt-1 text-sm text-muted">{children}</p>}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="m-4 rounded-3xl border border-terra/30 bg-terra-soft p-6 text-center">
      <AlertTriangle className="mx-auto mb-2 text-terra-dark" />
      <p className="font-display text-lg">We couldn’t load this registry</p>
      <p className="mt-1 text-sm text-muted">{message || 'Check your connection and try again.'}</p>
      {onRetry && <button className="btn btn-primary mt-4" onClick={onRetry}>Try again</button>}
    </div>
  )
}

export function Summary({ items }) {
  const raised = items.reduce((s, i) => s + i.raised_amount, 0)
  const goal = items.reduce((s, i) => s + i.target_amount, 0)
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-sm font-semibold text-muted">Total funded</p>
      <p className="mb-2 font-display text-3xl">{fmtINR(raised)}<span className="font-sans text-base text-muted"> of {fmtINR(goal)}</span></p>
      <ProgressBar raised={raised} target={goal} />
    </div>
  )
}
