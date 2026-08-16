import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('sort_order', { ascending: true });
    if (itemsError) throw itemsError;

    const { data: variants, error: variantsError } = await supabase
      .from('menu_variants')
      .select('*')
      .order('sort_order', { ascending: true });
    if (variantsError) throw variantsError;

    const { data: modifiers, error: modifiersError } = await supabase
      .from('modifiers')
      .select('*')
      .order('sort_order', { ascending: true });
    if (modifiersError) throw modifiersError;

    const nested = (items || []).map((item) => ({
      ...item,
      variants: (variants || []).filter((v) => v.item_id === item.id),
    }));

    return res.status(200).json({ items: nested, modifiers: modifiers || [] });
  } catch (err) {
    console.error('Menu API error:', err);
    res.status(500).json({ error: err.message });
  }
}
