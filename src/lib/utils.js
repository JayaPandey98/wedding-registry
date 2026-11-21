export const ANON = 'Anonymous Well-Wisher'
export const CATEGORIES = ['Travel', 'Hobby', 'Home', 'Experience']
export const UPI_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/

export const fmtINR = (n) => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN')
export const pct = (raised, target) => (target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0)

export const slugify = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)

export const fmtDate = (d) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

export const timeAgo = (iso) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export const upiUri = ({ upiId, payee, amount, note }) =>
  `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payee)}&am=${Number(amount).toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`

export const CAT_BG = {
  Travel: 'linear-gradient(135deg,#E58F6B,#C85A32)',
  Hobby: 'linear-gradient(135deg,#7FA091,#4A6B5D)',
  Home: 'linear-gradient(135deg,#D9B77A,#B08A4A)',
  Experience: 'linear-gradient(135deg,#C98B6B,#8A5A44)',
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const t = document.createElement('textarea')
    t.value = text
    document.body.appendChild(t)
    t.select()
    document.execCommand('copy')
    t.remove()
  }
}
