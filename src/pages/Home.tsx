import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, Flame, Heart, MapPin, Star } from 'lucide-react';
import type { InstagramPost, MenuItem, Modifier, Review, StoreStatus } from '../lib/types';
import { pkr } from '../lib/format';
import ItemModal from '../components/ItemModal';

export default function Home({
  items,
  modifiers,
  status,
  loading,
}: {
  items: MenuItem[];
  modifiers: Modifier[];
  status: StoreStatus | null;
  loading: boolean;
}) {
  const featured = items.filter((i) => i.is_featured).slice(0, 4);
  const [active, setActive] = useState<MenuItem | null>(null);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [socialLoading, setSocialLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/instagram').then((r) => r.json()),
      fetch('/api/reviews').then((r) => r.json()),
    ])
      .then(([ig, rv]) => {
        if (cancelled) return;
        setPosts(Array.isArray(ig) ? ig : []);
        setReviews(Array.isArray(rv) ? rv : []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSocialLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <div>
      <section className="relative min-h-[100svh] overflow-hidden">
        <img
          src="/images/hero-burger.png"
          alt="Double smash cheeseburger with dripping cheddar and pickles"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/78 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/40" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-28 pt-32 md:justify-center md:px-6 md:pb-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {status && (
              <div
                className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  status.open
                    ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                    : 'border-white/15 bg-black/40 text-white/70'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${
                  status.open ? 'animate-pulse bg-emerald-400' : 'bg-white/40'
                }`} />
                {status.label}
              </div>
            )}
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-[#f5a623]">Sargodha Road \u00b7 Pearl City</p>
            <h1 className="max-w-3xl font-display text-[3.4rem] leading-[0.9] text-white sm:text-7xl md:text-8xl">
              FAISALABAD'S FINEST SMASH.
              <span className="block text-[#f5a623]">DIRECT TO YOUR DOOR.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
              Fresh Angus smashed on a screaming-hot flat top. Dripping cheddar. Toasted potato bun. Built for late nights on Sargodha Road.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-7 py-3.5 font-display text-2xl tracking-wide text-[#121212] shadow-[0_10px_40px_rgba(245,166,35,0.4)]"
              >
                <Flame size={20} /> ORDER NOW
              </Link>
              <Link
                to="/find-us"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white"
              >
                <MapPin size={16} /> Delivery zones
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/70">
              <span className="flex items-center gap-2"><Star size={16} className="text-[#f5a623]" /> {avg} from locals</span>
              <span className="flex items-center gap-2"><Clock size={16} className="text-[#f5a623]" /> Late-night weekends till 2 AM</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-[#161616] py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8e8e93] md:px-6">
          <span>Fresh Angus smash</span>
          <span className="text-[#f5a623]">\u00b7</span>
          <span>WhatsApp kitchen ticket</span>
          <span className="hidden text-[#f5a623] sm:inline">\u00b7</span>
          <span className="hidden sm:inline">Pearl City hub</span>
          <span className="hidden text-[#f5a623] md:inline">\u00b7</span>
          <span className="hidden md:inline">6\u20138 km delivery radius</span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#f5a623]">House favourites</p>
            <h2 className="font-display text-5xl text-white md:text-6xl">THE SMASH LINE</h2>
          </div>
          <Link to="/menu" className="hidden items-center gap-1 text-sm font-semibold text-[#f5a623] md:inline-flex">
            Full menu <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-3xl bg-[#1e1e1e]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((item, i) => (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => setActive(item)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group overflow-hidden rounded-3xl border border-white/8 bg-[#1e1e1e] text-left"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {item.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-[#f5a623] px-2 py-0.5 text-[10px] font-bold uppercase text-[#121212]">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-2xl text-white">{item.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#8e8e93]">{item.description}</p>
                  <p className="mt-3 text-sm font-bold text-[#f5a623]">
                    from {pkr(item.variants[0]?.price || 0)}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
        <Link to="/menu" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#f5a623] md:hidden">
          Full menu <ChevronRight size={16} />
        </Link>
      </section>

      <section className="bg-[#161616] py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2 md:px-6">
          <img src="/images/ig-grill.jpg" alt="Smashed patties on the flat top" className="h-80 w-full rounded-3xl object-cover" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#f5a623]">How it works</p>
            <h2 className="font-display text-5xl text-white">WHATSAPP CART. CLEAN TICKET. NO CHAOS.</h2>
            <ol className="mt-6 space-y-4">
              {[
                ['01', 'Build your smash', 'Add extra patties, jalape\u00f1os, or make it a meal. Price updates live.'],
                ['02', 'Drop your details', 'Name, zone, and address \u2014 we only deliver inside the Faisalabad radius.'],
                ['03', 'Confirm on WhatsApp', 'One tap opens a kitchen-ready ticket. We reply: Confirmed. ETA 30 mins.'],
              ].map(([n, t, d]) => (
                <li key={n} className="flex gap-4">
                  <span className="font-display text-3xl text-[#f5a623]">{n}</span>
                  <div>
                    <p className="font-semibold text-white">{t}</p>
                    <p className="text-sm text-[#8e8e93]">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#f5a623]">From the grill</p>
            <h2 className="font-display text-5xl text-white">INSTAGRAM FEED</h2>
          </div>
          <a
            href="https://instagram.com/buzzsmashburgers"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-[#f5a623]"
          >
            @buzzsmashburgers
          </a>
        </div>
        {socialLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-[#1e1e1e]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {posts.map((p) => (
              <a
                key={p.id}
                href="https://instagram.com/buzzsmashburgers"
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square overflow-hidden rounded-2xl"
              >
                <img src={p.image_url} alt={p.caption} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/10 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                  <p className="flex items-center gap-1 text-xs font-semibold"><Heart size={12} /> {p.likes}</p>
                  <p className="line-clamp-2 text-xs text-white/80">{p.caption}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#161616] py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#f5a623]">Social proof</p>
          <h2 className="mb-8 font-display text-5xl text-white">WHAT FAISALABAD SAYS</h2>
          {socialLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-3xl bg-[#1e1e1e]" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {reviews.slice(0, 6).map((r) => (
                <article key={r.id} className="rounded-3xl border border-white/8 bg-[#1e1e1e] p-5">
                  <div className="mb-3 flex items-center gap-1 text-[#f5a623]">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-white/80">\u201c{r.comment}\u201d</p>
                  <p className="mt-4 text-sm font-semibold text-white">{r.customer_name}</p>
                  <p className="text-xs text-[#8e8e93]">{r.neighborhood}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {active && <ItemModal item={active} modifiers={modifiers} onClose={() => setActive(null)} />}
    </div>
  );
}
