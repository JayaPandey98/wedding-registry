import { supabase } from './supabase'

export async function getOwnRegistry(ownerId) {
  const { data, error } = await supabase.from('registries').select('*').eq('owner_id', ownerId).maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function slugAvailable(slug) {
  const { data, error } = await supabase.from('registries').select('id').eq('slug', slug).maybeSingle()
  if (error) throw new Error(error.message)
  return !data
}

export async function createRegistry(values) {
  const { data, error } = await supabase.from('registries').insert(values).select().single()
  if (error) throw new Error(error.code === '23505' ? 'That link is already taken. Try another.' : error.message)
  return data
}
