import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { pkr } from '../lib/format';
import type { DeliveryZone, SettingsMap, StoreStatus } from '../lib/types';

export default function Checkout({
  settings,
  status,
}: {
  settings: SettingsMap;
  status: StoreStatus | null;
}) {
  const { items, subtotal, clearCart } = useCart();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ whatsappUrl: string; ticket: string; code: string } | null>(null);
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    address: '',
    zone_name: '',
    order_type: 'delivery' as 'delivery' | 'takeaway',
    notes: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/zones')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setZones(list);
        if (list[0]) setForm((f) => ({ ...f, zone_name: f.zone_name || list[0].name }));
      })
      .catch(() => setError('Could not load delivery zones.'))
      .finally(() => setLoading(false));
  }, []);

  const zone = zones.find((z) => z.name === form.zone_name);
  const deliveryFee = form.order_type === 'delivery' ? zone?.fee || 0 : 0;
  const total = subtotal + deliveryFee;

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.customer_name.trim()) next.customer_name = 'Name is required';
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 10) next.phone = 'Enter a valid Pakistani mobile number';
    if (form.order_type === 'delivery') {
      if (!form.address.trim() || form.address.trim().length < 8) {
        next.address = 'House / street / society is required';
      }
      if (!form.zone_name) next.zone_name = 'Pick a delivery zone';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((l) => ({
            item_id: l.item_id,
            name: l.name,
            variant_name: l.variant_name,
            variant_price: l.variant_price,
            modifiers: l.modifiers,
            meal: l.meal,
            meal_price: l.meal_price,
            qty: l.qty,
            notes: l.notes,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not place order');
      setResult({
        whatsappUrl: data.whatsappUrl,
        ticket: data.ticket,
        code: data.order?.order_code,
      });
      clearCart();
      window.open(data.whatsappUrl, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-xl px-4 pb-28 pt-32 text-center">
        <CheckCircle2 className="mx-auto text-[#f5a623]" size={48} />
        <h1 className="mt-4 font-display text-5xl text-white">TICKET SENT</h1>
        <p className="mt-2 text-sm text-[#8e8e93]">
          Order {result.code} is formatted for the kitchen. Finish on WhatsApp if the chat didn\u2019t open.
        </p>
        <a
          href={result.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-[#052e16]"
        >
          <MessageCircle size={18} /> Open WhatsApp ticket
        </a>
        <pre className="mt-6 overflow-x-auto rounded-2xl border border-white/8 bg-[#1e1e1e] p-4 text-left text-xs leading-relaxed text-white/80 whitespace-pre-wrap">
          {result.ticket}
        </pre>
        <Link to="/menu" className="mt-6 inline-block text-sm text-[#f5a623]">
          Smash another one
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-28 pt-32 text-center">
        <h1 className="font-display text-5xl text-white">CART IS EMPTY</h1>
        <p className="mt-2 text-sm text-[#8e8e93]">Add a smash before checkout.</p>
        <Link to="/menu" className="mt-6 inline-block rounded-full bg-[#f5a623] px-6 py-3 font-display text-xl text-[#121212]">
          OPEN MENU
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-28 pt-28 lg:grid-cols-5 md:px-6">
      <form onSubmit={submit} className="lg:col-span-3">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#f5a623]">WhatsApp handoff</p>
        <h1 className="font-display text-5xl text-white">CHECKOUT</h1>
        {status && !status.open && (
          <p className="mt-3 rounded-2xl border border-[#f5a623]/30 bg-[#f5a623]/10 px-4 py-3 text-sm text-[#f5a623]">
            Kitchen is closed \u2014 this will send as a pre-order for the next service.
          </p>
        )}
        {error && <p className="mt-3 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        <div className="mt-6 grid grid-cols-2 gap-2">
          {(['delivery', 'takeaway'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm({ ...form, order_type: t })}
              className={`rounded-2xl border px-4 py-3 text-sm font-bold uppercase tracking-wider ${
                form.order_type === t ? 'border-[#f5a623] bg-[#f5a623]/12 text-white' : 'border-white/10 text-white/70'
              }`}
            >
              {t === 'delivery' ? 'Home Delivery' : 'Takeaway'}
            </button>
          ))}
        </div>

        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.16em] text-[#8e8e93]">
          Name
          <input
            value={form.customer_name}
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[#1e1e1e] px-4 py-3 text-sm text-white outline-none focus:border-[#f5a623]"
            placeholder="Ali Khan"
          />
          {fieldErrors.customer_name && <span className="mt-1 block text-[11px] normal-case tracking-normal text-red-300">{fieldErrors.customer_name}</span>}
        </label>

        <label className="mt-4 block text-xs font-bold uppercase tracking-[0.16em] text-[#8e8e93]">
          Phone / WhatsApp
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[#1e1e1e] px-4 py-3 text-sm text-white outline-none focus:border-[#f5a623]"
            placeholder="0300-1234567"
          />
          {fieldErrors.phone && <span className="mt-1 block text-[11px] normal-case tracking-normal text-red-300">{fieldErrors.phone}</span>}
        </label>

        {form.order_type === 'delivery' && (
          <>
            <label className="mt-4 block text-xs font-bold uppercase tracking-[0.16em] text-[#8e8e93]">
              Delivery zone
              <select
                value={form.zone_name}
                onChange={(e) => setForm({ ...form, zone_name: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#1e1e1e] px-4 py-3 text-sm text-white outline-none focus:border-[#f5a623]"
              >
                {loading && <option>Loading zones...</option>}
                {zones.map((z) => (
                  <option key={z.id} value={z.name}>
                    {z.name} \u2014 {z.fee === 0 ? 'Free' : `PKR ${z.fee}`}
                  </option>
                ))}
              </select>
              {fieldErrors.zone_name && <span className="mt-1 block text-[11px] normal-case tracking-normal text-red-300">{fieldErrors.zone_name}</span>}
            </label>
            <label className="mt-4 block text-xs font-bold uppercase tracking-[0.16em] text-[#8e8e93]">
              House / street / society
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                placeholder="House 42, Street 5, Eden Garden, Sargodha Road"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#1e1e1e] px-4 py-3 text-sm text-white outline-none focus:border-[#f5a623]"
              />
              {fieldErrors.address && <span className="mt-1 block text-[11px] normal-case tracking-normal text-red-300">{fieldErrors.address}</span>}
            </label>
          </>
        )}

        <label className="mt-4 block text-xs font-bold uppercase tracking-[0.16em] text-[#8e8e93]">
          Notes for the kitchen
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[#1e1e1e] px-4 py-3 text-sm text-white outline-none focus:border-[#f5a623]"
            placeholder="Gate code, extra napkins..."
          />
        </label>

        <button
          disabled={submitting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 font-display text-2xl text-[#052e16] disabled:opacity-60"
        >
          <MessageCircle size={20} />
          {submitting ? 'BUILDING TICKET...' : 'PLACE ORDER VIA WHATSAPP'}
        </button>
        <p className="mt-2 text-center text-[11px] text-[#8e8e93]">
          Routes to {settings.whatsapp_number || 'the Buzz kitchen line'} as a formatted ticket. COD only.
        </p>
      </form>

      <aside className="h-fit rounded-3xl border border-white/8 bg-[#1e1e1e] p-5 lg:col-span-2 lg:sticky lg:top-24">
        <h2 className="font-display text-3xl text-white">YOUR ORDER</h2>
        <ul className="mt-4 space-y-3">
          {items.map((l) => (
            <li key={l.uid} className="flex justify-between gap-3 text-sm">
              <span className="text-white/80">
                {l.qty}x {l.variant_name !== 'Regular' ? `${l.variant_name} ` : ''}{l.name}
                {l.modifiers.length > 0 && (
                  <span className="block text-[11px] text-[#8e8e93]">{l.modifiers.map((m) => m.name).join(', ')}</span>
                )}
                {l.meal && <span className="block text-[11px] text-[#8e8e93]">Meal</span>}
              </span>
              <span className="shrink-0 font-semibold text-white">
                {pkr((l.variant_price + l.modifiers.reduce((s, m) => s + m.price, 0) + (l.meal ? l.meal_price : 0)) * l.qty)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-white/8 pt-4 text-sm">
          <div className="flex justify-between text-[#8e8e93]">
            <span>Subtotal</span><span>{pkr(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#8e8e93]">
            <span>Delivery</span><span>{form.order_type === 'takeaway' ? '\u2014' : pkr(deliveryFee)}</span>
          </div>
          <div className="flex justify-between pt-2 font-display text-3xl text-white">
            <span>TOTAL</span><span>{pkr(total)}</span>
          </div>
          <p className="text-[11px] text-[#8e8e93]">Payable cash on delivery / collection</p>
        </div>
      </aside>
    </div>
  );
}
