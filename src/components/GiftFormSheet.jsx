import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Sheet } from './ui'
import { ICONS, ICON_NAMES } from '../lib/icons'
import { CATEGORIES } from '../lib/utils'

function Form({ initial, onSave, onClose }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [target, setTarget] = useState(initial?.target_amount || '')
  const [category, setCategory] = useState(initial?.category || 'Travel')
  const [icon, setIcon] = useState(initial?.icon_name || 'Gift')
  const [image, setImage] = useState(initial?.image_url || '')
  const [note, setNote] = useState(initial?.note || '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const imgOk = !image.trim() || /^https:\/\/\S+$/.test(image.trim())
  const valid = title.trim() && Number(target) > 0 && imgOk

  async function submit() {
    setBusy(true); setErr('')
    try {
      await onSave({ title: title.trim(), target_amount: Number(target), category, icon_name: icon, image_url: image.trim() || null, note: note.trim() })
      onClose()
    } catch (e) { setErr(e.message); setBusy(false) }
  }

  return (
    <div className="space-y-4">
      <input className="field" maxLength={120} placeholder="Gift title, e.g. Honeymoon in Europe" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="relative">
        <span className="absolute left-4 top-3 text-muted">₹</span>
        <input className="field !pl-8" type="number" min="1" inputMode="numeric" placeholder="Target amount" value={target} onChange={(e) => setTarget(e.target.value)} />
      </div>
      <div>
        <p className="mb-2 text-sm font-bold">Category</p>
        <div className="flex flex-wrap gap-2">{CATEGORIES.map((c) => <button key={c} onClick={() => setCategory(c)} className={`chip ${category === c ? 'chip-on' : ''}`}>{c}</button>)}</div>
      </div>
      <div>
        <p className="mb-2 text-sm font-bold">Icon</p>
        <div className="flex flex-wrap gap-2">
          {ICON_NAMES.map((n) => { const I = ICONS[n]; return (
            <button key={n} onClick={() => setIcon(n)} aria-label={n} aria-pressed={icon === n} className={`chip !p-2.5 ${icon === n ? 'chip-on' : ''}`}><I size={20} /></button>
          ) })}
        </div>
      </div>
      <div>
        <input className="field" placeholder="Photo link (optional, https://…)" value={image} onChange={(e) => setImage(e.target.value)} />
        <p className={`mt-1 text-xs ${imgOk ? 'text-muted' : 'text-terra-dark'}`}>{imgOk ? 'Paste any image link, for example from Unsplash. Nothing is uploaded or stored.' : 'Image links must start with https://'}</p>
      </div>
      <textarea className="field" rows="3" maxLength={400} placeholder="Why does this gift mean something to you?" value={note} onChange={(e) => setNote(e.target.value)} />
      {err && <p role="alert" className="rounded-2xl bg-terra-soft p-3 text-sm text-terra-dark">{err}</p>}
      <button disabled={!valid || busy} onClick={submit} className="btn btn-primary w-full !py-4 text-base">
        {busy ? <Loader2 size={18} className="animate-spin" /> : initial ? 'Save changes' : 'Add to registry'}
      </button>
    </div>
  )
}

export default function GiftFormSheet({ state, onClose, onSave }) {
  return (
    <Sheet open={!!state} onClose={onClose} title={state?.item ? 'Edit gift' : 'Add a gift'}>
      {state && <Form initial={state.item} onSave={onSave} onClose={onClose} />}
    </Sheet>
  )
}
