import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { customer_name, rating, comment, neighborhood } = req.body || {};
      if (!customer_name || !comment) {
        return res.status(400).json({ error: 'Name and review are required.' });
      }
      const stars = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          customer_name: String(customer_name).trim().slice(0, 80),
          rating: stars,
          comment: String(comment).trim().slice(0, 600),
          neighborhood: String(neighborhood || '').trim().slice(0, 80),
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Reviews API error:', err);
    res.status(500).json({ error: err.message });
  }
}
