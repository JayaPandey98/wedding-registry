import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, Check, Copy, Smartphone, Loader2, EyeOff } from 'lucide-react'
import { Sheet } from './ui'
import { ANON, copyText, fmtINR, upiUri } from '../lib/utils'

const COOLDOWN = 30000
const APPS = [['GPay', '#4285F4'], ['PhonePe', '#5F259F'], ['Paytm', '#00A6E0'], ['BHIM', '#F37021']]

function Body({ item, registry, onClose, onConfirm }) {
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState(2500)
  const [custom, setCustom] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [anon, setAnon] = useState(false)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const value = useCustom ? Math.floor(Number(custom) || 0) : amount
  const valid = value >= 1 && value <= 1000000 && (anon || name.trim().length > 0)
  const uri = upiUri({ upiId: registry.upi_id, payee: registry.couple_names, amount: value, note: 'Wedding Gift: ' + item.title })

  async function copy() {
    await copyText(registry.upi_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function confirm() {
    setErr('')
    let last = 0
    try { last = Number(localStorage.getItem('gr_last') || 0) } catch {}
    const wait = COOLDOWN - (Date.now() - last)
    if (wait > 0) return setErr(`Please wait ${Math.ceil(wait / 1000)} seconds before sending another contribution.`)
    setBusy(true)
    try {
      await onConfirm({ item, amount: value, anonymous: anon, name: anon ? ANON : name.trim(), message: message.trim() })
      try { localStorage.setItem('gr_last', String(Date.now())) } catch {}
      onClose()
    } catch (e) {
      setErr(e.message || 'We couldn’t save your contribution. Try again.')
      setBusy(false)
    }
  }

  const dots = (
    <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-muted">
      {[1, 2].map((s) => <span key={s} className="h-1.5 rounded-full transition-all" style={{ width: step === s ? 28 : 12, background: step >= s ? '#C85A32' : '#EBE4D6' }} />)}
      <span>Step {step} of 2: {step === 1 ? 'Gift details' : 'Pay with UPI'}</span>
    </div>
  )

  if (step === 2)
    return (
      <div className="space-y-4">
        {dots}
        <button onClick={() => setStep(1)} className="inline-flex items-center gap-1 text-sm font-semibold text-terra"><ArrowLeft size={16} /> Edit details</button>
        <div className="text-center">
          <p className="text-sm text-muted">{item.title}</p>
          <p className="font-display text-4xl">{fmtINR(value)}</p>
          <p className="text-sm text-muted">from {anon ? ANON : name.trim()}</p>
        </div>
        <div className="mx-auto w-fit rounded-3xl border border-line bg-white p-3">
          <QRCodeSVG value={uri} size={208} level="M" bgColor="#ffffff" fgColor="#1b1b1b" />
        </div>
        <p className="text-center text-[13px] text-muted">Scan with any UPI app, or pay to the UPI ID below.</p>
        <div className="flex items-center gap-2 rounded-2xl bg-cream p-2 pl-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted">UPI ID</p>
            <p className="truncate font-bold">{registry.upi_id}</p>
          </div>
          <button onClick={copy} className={`btn ${copied ? 'btn-sage' : 'btn-soft'} !px-4 !py-2`}>
            {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy UPI ID</>}
          </button>
        </div>
        <a href={uri} className="btn btn-ghost w-full"><Smartphone size={18} /> Open UPI App</a>
        <div className="flex flex-wrap justify-center gap-2">
          {APPS.map(([n, c]) => (
            <span key={n} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-bold">
              <span className="grid h-4 w-4 place-items-center rounded-full text-[9px] text-white" style={{ background: c }}>{n[0]}</span>{n}
            </span>
          ))}
        </div>
        {err && <p role="alert" className="rounded-2xl bg-terra-soft p-3 text-sm text-terra-dark">{err}</p>}
        <button onClick={confirm} disabled={busy} className="btn btn-primary w-full !py-4 text-base">
          {busy ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : 'I’ve Completed the Payment'}
        </button>
        <p className="text-center text-xs text-muted">The couple confirms each payment against their UPI app before it is marked verified.</p>
      </div>
    )

  return (
    <div className="space-y-4">
      {dots}
      <div>
        <p className="mb-2 text-sm font-bold">Choose an amount</p>
        <div className="flex flex-wrap gap-2">
          {[1000, 2500, 5000].map((a) => (
            <button key={a} className={`chip ${!useCustom && amount === a ? 'chip-on' : ''}`} onClick={() => { setUseCustom(false); setAmount(a) }}>{fmtINR(a)}</button>
          ))}
          <button className={`chip ${useCustom ? 'chip-on' : ''}`} onClick={() => setUseCustom(true)}>Custom</button>
        </div>
        {useCustom && (
          <div className="relative mt-3">
            <span className="absolute left-4 top-3 text-muted">₹</span>
            <input autoFocus type="number" min="1" max="1000000" inputMode="numeric" className="field !pl-8" placeholder="Enter any amount" value={custom} onChange={(e) => setCustom(e.target.value)} />
          </div>
        )}
      </div>
      <button role="switch" aria-checked={anon} onClick={() => setAnon(!anon)} className="flex w-full items-center gap-3 rounded-2xl bg-cream p-3 text-left">
        <EyeOff size={20} className="text-sage" />
        <span className="flex-1">
          <span className="block text-sm font-bold">Contribute Anonymously</span>
          <span className="block text-xs text-muted">Shown as “{ANON}”</span>
        </span>
        <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${anon ? 'bg-sage' : 'bg-line'}`}>
          <span className="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all" style={{ left: anon ? 24 : 4 }} />
        </span>
      </button>
      <input className="field" maxLength={80} disabled={anon} placeholder="Your name" value={anon ? ANON : name} onChange={(e) => setName(e.target.value)} aria-label="Your name" />
      <textarea className="field" rows="3" maxLength={400} placeholder="Add a congratulatory message (optional)" value={message} onChange={(e) => setMessage(e.target.value)} />
      <button disabled={!valid} onClick={() => setStep(2)} className="btn btn-primary w-full !py-4 text-base">
        {valid ? 'Proceed to Pay via UPI' : anon ? 'Enter an amount to continue' : 'Enter an amount and your name'}
      </button>
    </div>
  )
}

export default function ContributeSheet({ item, registry, onClose, onConfirm }) {
  return (
    <Sheet open={!!item} onClose={onClose} title={item ? `Contribute to ${item.title}` : ''}>
      {item && <Body item={item} registry={registry} onClose={onClose} onConfirm={onConfirm} />}
    </Sheet>
  )
}
