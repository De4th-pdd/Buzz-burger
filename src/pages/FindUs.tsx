import { useEffect, useState, type FormEvent } from 'react';
import { Clock, MapPin, Phone, Star } from 'lucide-react';
import type { DeliveryZone, Review, SettingsMap, StoreStatus } from '../lib/types';

export default function FindUs({
  settings,
  status,
}: {
  settings: SettingsMap;
  status: StoreStatus | null;
}) {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ customer_name: '', neighborhood: '', rating: 5, comment: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const load = async () => {
    try {
      const [z, r] = await Promise.all([
        fetch('/api/zones').then((x) => x.json()),
        fetch('/api/reviews').then((x) => x.json()),
      ]);
      setZones(Array.isArray(z) ? z : []);
      setReviews(Array.isArray(r) ? r : []);
    } catch {
      setError('Could not load location data. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.comment.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not post review');
      }
      setDone(true);
      setForm({ customer_name: '', neighborhood: '', rating: 5, comment: '' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post review');
    } finally {
      setSending(false);
    }
  };

  const mapsQuery = encodeURIComponent(
    settings.address || 'Pearl City commercial hub, Sargodha Road, Faisalabad',
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-28 md:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#f5a623]">Pearl City hub</p>
      <h1 className="font-display text-6xl text-white md:text-7xl">FIND US</h1>
      <p className="mt-2 max-w-xl text-sm text-[#8e8e93]">
        Burger delivery near Pearl City, Eden Garden, FDA City, and the Sargodha Road corridor.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="overflow-hidden rounded-3xl border border-white/8 lg:col-span-3">
          <iframe
            title="Buzz Smash Burgers map"
            src={`https://maps.google.com/maps?q=${mapsQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
            className="h-[360px] w-full grayscale contrast-125 invert-[0.9] md:h-[460px]"
            loading="lazy"
          />
        </div>
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-3xl border border-white/8 bg-[#1e1e1e] p-5">
            <p className="flex items-start gap-2 text-sm text-white/85">
              <MapPin className="mt-0.5 text-[#f5a623]" size={16} />
              {settings.address || 'Pearl City commercial hub, Sargodha Road, Faisalabad'}
            </p>
            <a href={`tel:${settings.phone || '0321-4567890'}`} className="mt-3 flex items-center gap-2 text-sm text-white/85">
              <Phone size={16} className="text-[#f5a623]" /> {settings.phone || '0321-4567890'}
            </a>
            <p className="mt-3 flex items-start gap-2 text-sm text-white/85">
              <Clock className="mt-0.5 text-[#f5a623]" size={16} />
              <span>
                Mon\u2013Thu 5:00 PM \u2013 1:00 AM
                <br />
                Fri\u2013Sun 5:00 PM \u2013 2:00 AM
              </span>
            </p>
            {status && (
              <p className={`mt-4 rounded-full px-3 py-1.5 text-xs font-semibold ${
                status.open ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/5 text-white/60'
              }`}>{status.label}</p>
            )}
          </div>
          <div className="rounded-3xl border border-[#f5a623]/30 bg-[#f5a623]/8 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f5a623]">Late-night weekends</p>
            <p className="mt-2 font-display text-4xl text-white">TILL 2 AM</p>
            <p className="text-sm text-white/70">Friday through Sunday the grill stays hot past midnight.</p>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-4xl text-white">DELIVERY RADIUS</h2>
        <p className="mt-1 text-sm text-[#8e8e93]">
          6\u20138 km from the Pearl City hub. If your society isn\u2019t listed, we can\u2019t take the order yet.
        </p>
        {loading ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#1e1e1e]" />
            ))}
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {zones.map((z) => (
              <div key={z.id} className="rounded-2xl border border-white/8 bg-[#1e1e1e] p-4">
                <p className="font-semibold text-white">{z.name}</p>
                <p className="text-sm text-[#f5a623]">Delivery {z.fee === 0 ? 'free' : `PKR ${z.fee}`}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="font-display text-4xl text-white">LOCAL LOVE</h2>
          <div className="mt-4 grid gap-3">
            {reviews.map((r) => (
              <article key={r.id} className="rounded-2xl border border-white/8 bg-[#1e1e1e] p-4">
                <div className="mb-1 flex text-[#f5a623]">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-white/80">{r.comment}</p>
                <p className="mt-2 text-xs text-[#8e8e93]">
                  {r.customer_name} \u00b7 {r.neighborhood}
                </p>
              </article>
            ))}
          </div>
        </div>
        <form onSubmit={submitReview} className="rounded-3xl border border-white/8 bg-[#1e1e1e] p-5 lg:col-span-2">
          <h3 className="font-display text-3xl text-white">LEAVE A BITE</h3>
          {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
          {done && <p className="mt-2 text-sm text-emerald-300">Thanks \u2014 posted for the crew.</p>}
          <input
            required
            value={form.customer_name}
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            placeholder="Your name"
            className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm outline-none focus:border-[#f5a623]"
          />
          <input
            value={form.neighborhood}
            onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
            placeholder="Society / area"
            className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm outline-none focus:border-[#f5a623]"
          />
          <label className="mt-3 block text-xs text-[#8e8e93]">
            Rating
            <select
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} stars
                </option>
              ))}
            </select>
          </label>
          <textarea
            required
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            placeholder="How was the smash?"
            rows={4}
            className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm outline-none focus:border-[#f5a623]"
          />
          <button
            disabled={sending}
            className="mt-4 w-full rounded-full bg-[#f5a623] py-3 font-display text-xl text-[#121212] disabled:opacity-60"
          >
            {sending ? 'POSTING...' : 'POST REVIEW'}
          </button>
        </form>
      </section>
    </div>
  );
}
