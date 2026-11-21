import { useState } from 'react'
import { Plus, LogOut, ExternalLink, Gift } from 'lucide-react'
import { Link } from 'react-router-dom'
import GiftCard from './GiftCard'
import ContributeSheet from './ContributeSheet'
import GiftFormSheet from './GiftFormSheet'
import { ReconcileFeed, ShareCard, UpiBanner } from './CoupleTools'
import { EmptyState, Summary } from './ui'
import { useToast } from './Toast'
import { fmtDate, fmtINR } from '../lib/utils'

const byItem = (contribs, id) => contribs.filter((c) => c.item_id === id)

export function GuestView({ store }) {
  const { registry, items, contribs, actions } = store
  const [sel, setSel] = useState(null)
  const toast = useToast()
  const raised = items.reduce((s, i) => s + i.raised_amount, 0)

  const confirm = async (data) => {
    await actions.contribute(data)
    toast(data.anonymous ? `Thank you! ${fmtINR(data.amount)} sent to ${registry.couple_names}.` : `Thank you, ${data.name.split(' ')[0]}! ${fmtINR(data.amount)} sent to ${registry.couple_names}.`, { confetti: true })
  }

  return (
    <div className="pb-10">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-cream/95 px-4 py-3 backdrop-blur">
        <h1 className="font-display text-lg">{registry.couple_names}</h1>
        <span className="rounded-full bg-sage-soft px-3 py-1 text-sm font-bold text-sage">{fmtINR(raised)} funded</span>
      </header>
      <div className="space-y-4 p-4">
        <div className="rounded-3xl bg-terra-soft p-5">
          <p className="text-sm font-semibold text-terra-dark">{fmtDate(registry.wedding_date)}</p>
          <h2 className="mt-1 font-display text-3xl leading-tight">{registry.couple_names}’s Wedding</h2>
          {registry.welcome_note && <p className="mt-2 text-[15px] text-ink/80">{registry.welcome_note}</p>}
          <div className="mt-4"><Summary items={items} /></div>
        </div>
        {items.length === 0 && <EmptyState title="The wishlist is still being written">Check back soon, the couple is adding their gifts.</EmptyState>}
        {items.map((it) => (
          <GiftCard key={it.id} item={it} mode="guest" contribs={byItem(contribs, it.id)} onContribute={() => setSel(it)} />
        ))}
      </div>
      <ContributeSheet item={sel} registry={registry} onClose={() => setSel(null)} onConfirm={confirm} />
    </div>
  )
}

export function CoupleView({ store, link, onSignOut, publicPath }) {
  const { registry, items, contribs, actions } = store
  const [form, setForm] = useState(null)
  const toast = useToast()
  const run = async (fn, ok) => { try { await fn(); ok && toast(ok) } catch (e) { toast(e.message, { tone: 'error' }) } }

  return (
    <div className="pb-28">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-line bg-cream/95 px-4 py-3 backdrop-blur">
        <div className="min-w-0">
          <h1 className="truncate font-display text-lg">{registry.couple_names}</h1>
          <p className="text-xs text-muted">Couple dashboard · {fmtDate(registry.wedding_date)}</p>
        </div>
        <div className="flex gap-2">
          {publicPath && <Link to={publicPath} className="btn btn-ghost !px-3 !py-2" aria-label="View public page"><ExternalLink size={16} /></Link>}
          {onSignOut && <button onClick={onSignOut} className="btn btn-ghost !px-3 !py-2" aria-label="Sign out"><LogOut size={16} /></button>}
        </div>
      </header>
      <div className="space-y-5 p-4">
        <Summary items={items} />
        <ShareCard link={link} names={registry.couple_names} />
        <UpiBanner upi={registry.upi_id} onSave={actions.updateRegistry} />
        <section className="space-y-3">
          <h2 className="font-display text-xl">Your wishlist</h2>
          {items.length === 0 && <EmptyState icon={Gift} title="Add your first gift">Tap the + button to add a honeymoon, a guitar or anything that would mean more than a dinner set.</EmptyState>}
          {items.map((it) => (
            <GiftCard key={it.id} item={it} mode="couple" contribs={byItem(contribs, it.id)}
              onEdit={() => setForm({ item: it })}
              onDelete={() => window.confirm(`Delete “${it.title}” and its contributions?`) && run(() => actions.deleteItem(it.id), 'Gift deleted')} />
          ))}
        </section>
        <ReconcileFeed contribs={contribs} items={items}
          onVerify={(id, v) => run(() => actions.setVerified(id, v), v ? 'Marked as verified' : 'Verification removed')}
          onRemove={(id) => run(() => actions.removeContribution(id), 'Contribution removed')} />
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md justify-end p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button onClick={() => setForm({ item: null })} aria-label="Add gift" className="pointer-events-auto grid h-16 w-16 place-items-center rounded-[1.25rem] bg-terra text-white shadow-lg active:scale-95"><Plus size={28} /></button>
      </div>
      <GiftFormSheet state={form} onClose={() => setForm(null)}
        onSave={(v) => (form.item ? actions.updateItem(form.item.id, v) : actions.addItem(v)).then(() => toast(form.item ? 'Changes saved' : 'Gift added to your registry'))} />
    </div>
  )
}
