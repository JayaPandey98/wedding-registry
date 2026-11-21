const day = 86400000
const ago = (d) => new Date(Date.now() - d * day).toISOString()

export const DEMO_REGISTRY = {
  id: 'demo',
  slug: 'aarav-priya',
  couple_names: 'Aarav & Priya',
  wedding_date: '2026-12-14',
  welcome_note: 'Your blessings are the best gift. If you would like to give more, help us collect memories instead of more things.',
  upi_id: 'aaravpriya@okicici',
}

export const DEMO_ITEMS = [
  { id: 'i1', registry_id: 'demo', title: 'Honeymoon in Europe', category: 'Travel', icon_name: 'Plane', image_url: null, target_amount: 150000, note: 'Ten days across Rome, Paris and Lisbon. We have talked about it since our first date.', created_at: ago(9) },
  { id: 'i2', registry_id: 'demo', title: 'Fender Stratocaster Guitar', category: 'Hobby', icon_name: 'Guitar', image_url: null, target_amount: 90000, note: 'Aarav has played borrowed guitars for ten years. Time for one of his own.', created_at: ago(8) },
  { id: 'i3', registry_id: 'demo', title: 'Espresso Machine', category: 'Home', icon_name: 'Coffee', image_url: null, target_amount: 65000, note: 'Priya’s mornings deserve better than instant coffee.', created_at: ago(7) },
  { id: 'i4', registry_id: 'demo', title: 'Sahyadri Camping Weekend', category: 'Experience', icon_name: 'Tent', image_url: null, target_amount: 50000, note: 'A tent, sleeping bags and a first trip as a married couple.', created_at: ago(6) },
]

export const DEMO_CONTRIBS = [
  { id: 'c1', item_id: 'i1', registry_id: 'demo', guest_name: 'Meera Kapoor', is_anonymous: false, amount: 25000, message: 'Eat all the pasta! Love you both.', is_verified: true, created_at: ago(4) },
  { id: 'c2', item_id: 'i1', registry_id: 'demo', guest_name: 'Rohan & Ishita', is_anonymous: false, amount: 31000, message: 'Send us postcards!', is_verified: true, created_at: ago(3) },
  { id: 'c3', item_id: 'i2', registry_id: 'demo', guest_name: 'Anonymous Well-Wisher', is_anonymous: true, amount: 12000, message: 'Play at our anniversary!', is_verified: false, created_at: ago(2) },
  { id: 'c4', item_id: 'i2', registry_id: 'demo', guest_name: 'Anita Aunty', is_anonymous: false, amount: 50000, message: 'Blessings, beta.', is_verified: true, created_at: ago(2) },
  { id: 'c5', item_id: 'i3', registry_id: 'demo', guest_name: 'The Deshmukhs', is_anonymous: false, amount: 65000, message: 'Cheers to many mornings together!', is_verified: true, created_at: ago(1) },
  { id: 'c6', item_id: 'i4', registry_id: 'demo', guest_name: 'Sneha', is_anonymous: false, amount: 7500, message: 'Adventure awaits!', is_verified: false, created_at: ago(0.2) },
]
