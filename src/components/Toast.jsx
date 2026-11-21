import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'

const Ctx = createContext(() => {})
export const useToast = () => useContext(Ctx)

const COLORS = ['#C85A32', '#4A6B5D', '#E8B04B', '#F2C9B5', '#8FB3A2']
const PIECES = Array.from({ length: 34 }, (_, i) => ({
  left: (i * 29) % 100, delay: (i % 8) * 0.07, color: COLORS[i % COLORS.length], size: 6 + (i % 4) * 2,
}))

function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden="true">
      {PIECES.map((p, i) => (
        <span key={i} className="absolute top-0 animate-fall rounded-sm opacity-0"
          style={{ left: p.left + '%', width: p.size, height: p.size * 1.6, background: p.color, animationDelay: p.delay + 's' }} />
      ))}
    </div>
  )
}

export function ToastProvider({ children }) {
  const [t, setT] = useState(null)
  const show = useCallback((message, opts = {}) => {
    const id = Date.now()
    setT({ id, message, error: opts.tone === 'error', confetti: !!opts.confetti })
    setTimeout(() => setT((c) => (c && c.id === id ? null : c)), 3600)
  }, [])
  return (
    <Ctx.Provider value={show}>
      {children}
      {t?.confetti && <Confetti key={t.id} />}
      {t && (
        <div role="status" className="fixed inset-x-0 bottom-6 z-[80] mx-auto flex max-w-md px-4 animate-fade">
          <div className={`flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg ${t.error ? 'bg-terra-dark text-white' : 'bg-ink text-cream'}`}>
            {t.error ? <AlertCircle size={18} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#9ED0B8]" />}
            <span>{t.message}</span>
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}
