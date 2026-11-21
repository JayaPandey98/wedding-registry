import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ANON, } from '../lib/utils'
import { DEMO_REGISTRY, DEMO_ITEMS, DEMO_CONTRIBS } from '../lib/demoData'

// Both stores expose the same shape so every view works with live data or demo data:
// { loading, error, registry, items, contribs, actions, reload }

const num = (r, keys) => keys.reduce((o, k) => ({ ...o, [k]: Number(o[k]) }), { ...r })
const guard = async (p) => {
  const { data, error } = await p
  if (error) throw new Error(error.message)
  return data
}

export function useSupabaseStore({ slug, ownerId }) {
  const [state, setState] = useState({ loading: true, error: null, registry: null, items: [], contribs: [] })

  const load = useCallback(async () => {
    try {
      let q = supabase.from('registries').select('*')
      q = slug ? q.eq('slug', slug) : q.eq('owner_id', ownerId)
      const registry = await guard(q.maybeSingle())
      if (!registry) return setState({ loading: false, error: null, registry: null, items: [], contribs: [] })
      const [items, contribs] = await Promise.all([
        guard(supabase.from('wishlist_items').select('*').eq('registry_id', registry.id).order('created_at')),
        guard(supabase.from('contributions').select('*').eq('registry_id', registry.id).order('created_at', { ascending: false })),
      ])
      setState({
        loading: false, error: null, registry,
        items: items.map((i) => num(i, ['target_amount', 'raised_amount'])),
        contribs: contribs.map((c) => num(c, ['amount'])),
      })
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message }))
    }
  }, [slug, ownerId])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [load])

  const rid = state.registry?.id
  const actions = {
    updateRegistry: async (patch) => { await guard(supabase.from('registries').update(patch).eq('id', rid)); await load() },
    addItem: async (v) => { await guard(supabase.from('wishlist_items').insert({ ...v, registry_id: rid })); await load() },
    updateItem: async (id, v) => { await guard(supabase.from('wishlist_items').update(v).eq('id', id)); await load() },
    deleteItem: async (id) => { await guard(supabase.from('wishlist_items').delete().eq('id', id)); await load() },
    contribute: async ({ item, amount, anonymous, name, message }) => {
      const row = { item_id: item.id, registry_id: rid, guest_name: anonymous ? ANON : name, is_anonymous: anonymous, amount, message }
      const data = await guard(supabase.from('contributions').insert(row).select().single())
      // optimistic update, then reconcile with the trigger-computed totals
      setState((s) => ({
        ...s,
        contribs: [{ ...data, amount: Number(data.amount) }, ...s.contribs],
        items: s.items.map((i) => (i.id === item.id ? { ...i, raised_amount: i.raised_amount + amount } : i)),
      }))
      load()
    },
    setVerified: async (id, v) => { await guard(supabase.from('contributions').update({ is_verified: v }).eq('id', id)); await load() },
    removeContribution: async (id) => { await guard(supabase.from('contributions').delete().eq('id', id)); await load() },
  }
  return { ...state, actions, reload: load }
}

export function useDemoStore() {
  const [registry, setRegistry] = useState(DEMO_REGISTRY)
  const [base, setItems] = useState(DEMO_ITEMS)
  const [contribs, setContribs] = useState(DEMO_CONTRIBS)
  const wait = () => new Promise((r) => setTimeout(r, 600))
  const uid = () => Math.random().toString(36).slice(2, 10)

  const items = useMemo(
    () => base.map((i) => ({ ...i, raised_amount: contribs.filter((c) => c.item_id === i.id).reduce((s, c) => s + c.amount, 0) })),
    [base, contribs]
  )
  const actions = {
    updateRegistry: async (patch) => { await wait(); setRegistry((r) => ({ ...r, ...patch })) },
    addItem: async (v) => setItems((p) => [...p, { id: uid(), registry_id: 'demo', created_at: new Date().toISOString(), ...v }]),
    updateItem: async (id, v) => setItems((p) => p.map((i) => (i.id === id ? { ...i, ...v } : i))),
    deleteItem: async (id) => { setItems((p) => p.filter((i) => i.id !== id)); setContribs((p) => p.filter((c) => c.item_id !== id)) },
    contribute: async ({ item, amount, anonymous, name, message }) => {
      await wait()
      setContribs((p) => [{ id: uid(), item_id: item.id, registry_id: 'demo', guest_name: anonymous ? ANON : name, is_anonymous: anonymous, amount, message, is_verified: false, created_at: new Date().toISOString() }, ...p])
    },
    setVerified: async (id, v) => setContribs((p) => p.map((c) => (c.id === id ? { ...c, is_verified: v } : c))),
    removeContribution: async (id) => setContribs((p) => p.filter((c) => c.id !== id)),
  }
  return { loading: false, error: null, registry, items, contribs, actions, reload: () => {} }
}
