import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const code = req.query.code;
      if (!code) {
        return res.status(400).json({ error: 'Order code is required.' });
      }
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_code', code)
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const {
        customer_name,
        phone,
        address,
        zone_name,
        order_type,
        items,
        notes,
      } = req.body || {};

      if (!customer_name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required.' });
      }
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty.' });
      }

      const type = order_type === 'takeaway' ? 'takeaway' : 'delivery';
      if (type === 'delivery' && !address) {
        return res.status(400).json({ error: 'Delivery address is required.' });
      }

      let deliveryFee = 0;
      let zoneName = zone_name || '';
      if (type === 'delivery') {
        const { data: zones, error: zoneError } = await supabase
          .from('delivery_zones')
          .select('*')
          .eq('is_active', true);
        if (zoneError) throw zoneError;
        const zone = (zones || []).find((z) => z.name === zone_name);
        if (!zone) {
          return res.status(400).json({ error: 'Please select a valid delivery zone.' });
        }
        deliveryFee = zone.fee;
        zoneName = zone.name;
      }

      const subtotal = items.reduce((sum, line) => {
        const mods = (line.modifiers || []).reduce((m, x) => m + (Number(x.price) || 0), 0);
        const meal = line.meal ? Number(line.meal_price) || 350 : 0;
        const unit = (Number(line.variant_price) || 0) + mods + meal;
        return sum + unit * (Number(line.qty) || 1);
      }, 0);

      const total = subtotal + deliveryFee;
      const orderCode = await uniqueCode();
      const placedAt = formatPktTime(new Date());
      const ticket = buildTicket({
        orderCode,
        type,
        customer_name,
        phone,
        address: address || '',
        zoneName,
        items,
        subtotal,
        deliveryFee,
        total,
        notes: notes || '',
        placedAt,
      });

      const { data: settings } = await supabase.from('store_settings').select('*');
      const settingMap = {};
      for (const row of settings || []) settingMap[row.key] = row.value;
      const waNumber = (settingMap.whatsapp_number || '923214567890').replace(/\D/g, '');

      const { data, error } = await supabase
        .from('orders')
        .insert({
          order_code: orderCode,
          customer_name: String(customer_name).trim().slice(0, 80),
          phone: String(phone).trim().slice(0, 24),
          address: String(address || '').trim().slice(0, 400),
          zone_name: zoneName,
          order_type: type,
          items,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          notes: String(notes || '').trim().slice(0, 400),
          ticket_text: ticket,
          status: 'pending',
        })
        .select()
        .single();
      if (error) throw error;

      const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(ticket)}`;
      return res.status(201).json({ order: data, whatsappUrl, ticket });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Orders API error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function uniqueCode() {
  for (let i = 0; i < 8; i++) {
    const code = `BSB-${Math.floor(1000 + Math.random() * 9000)}`;
    const { data } = await supabase.from('orders').select('id').eq('order_code', code).maybeSingle();
    if (!data) return code;
  }
  return `BSB-${Date.now().toString().slice(-4)}`;
}

function formatPktTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function pkr(n) {
  return `PKR ${Number(n).toLocaleString('en-PK')}`;
}

function buildTicket({
  orderCode,
  type,
  customer_name,
  phone,
  address,
  zoneName,
  items,
  subtotal,
  deliveryFee,
  total,
  notes,
  placedAt,
}) {
  const typeLabel = type === 'takeaway' ? 'Takeaway' : 'Home Delivery';
  const lines = items.map((line) => {
    const mods = (line.modifiers || []).map((m) => m.name + (m.price ? ` (+${pkr(m.price)})` : ''));
    if (line.meal) mods.push(`Make it a Meal (+${pkr(line.meal_price || 350)})`);
    const size = line.variant_name && line.variant_name !== 'Regular' ? line.variant_name + ' ' : '';
    let block = `${line.qty}x ${size}${line.name} (${pkr((Number(line.variant_price) || 0) * (Number(line.qty) || 1))})`;
    if (mods.length) block += `\n   \u2514 Modifiers: ${mods.join(', ')}`;
    if (line.notes) block += `\n   \u2514 Note: ${line.notes}`;
    return block;
  });

  return [
    '*NEW ORDER \u2014 BUZZ SMASH BURGERS*',
    '------------------------------------------',
    `*Order ID:* #${orderCode}`,
    `*Order Type:* ${typeLabel}`,
    '*Customer Details:*',
    `\u2022 Name: ${customer_name}`,
    `\u2022 Phone: ${phone}`,
    type === 'delivery'
      ? `\u2022 Delivery Address: ${address}${zoneName ? ` (${zoneName})` : ''}`
      : '\u2022 Collection: Pearl City / Sargodha Road hub',
    '*Order Items:*',
    ...lines,
    '------------------------------------------',
    `*Subtotal:* ${pkr(subtotal)}`,
    type === 'delivery' ? `*Delivery Fee:* ${pkr(deliveryFee)}` : '*Delivery Fee:* \u2014',
    `*TOTAL PAYABLE (COD):* ${pkr(total)}`,
    notes ? `*Kitchen Notes:* ${notes}` : null,
    '------------------------------------------',
    `\u23f0 *Time Placed:* ${placedAt}`,
  ]
    .filter(Boolean)
    .join('\n');
}
