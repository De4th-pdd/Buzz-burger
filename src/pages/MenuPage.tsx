import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { MenuItem, Modifier } from '../lib/types';
import { pkr } from '../lib/format';
import ItemModal from '../components/ItemModal';

const CATEGORIES = [
  { id: 'angus', label: 'Angus Beef Burgers' },
  { id: 'chicken', label: 'Chicken Burgers' },
  { id: 'sides', label: 'Loaded Fries & Sides' },
  { id: 'shakes', label: 'Shakes & Dips' },
];

export default function MenuPage({
  items,
  modifiers,
  loading,
  error,
}: {
  items: MenuItem[];
  modifiers: Modifier[];
  loading: boolean;
  error: string | null;
}) {
  const [openCats, setOpenCats] = useState<string[]>(CATEGORIES.map((c) => c.id));
  const [active, setActive] = useState<MenuItem | null>(null);
  const [filter, setFilter] = useState('all');

  const grouped = useMemo(() => {
    const map: Record<string, MenuItem[]> = {};
    for (const c of CATEGORIES) map[c.id] = [];
    for (const item of items) {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    }
    return map;
  }, [items]);

  const toggle = (id: string) => {
    setOpenCats((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const visible = filter === 'all' ? CATEGORIES : CATEGORIES.filter((c) => c.id === filter);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-28 md:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#f5a623]">Mobile-first menu</p>
      <h1 className="font-display text-6xl text-white md:text-7xl">THE BOARD</h1>
      <p className="mt-2 max-w-xl text-sm text-[#8e8e93]">
        Tap a smash, stack modifiers, make it a meal. Checkout drops a clean ticket straight into WhatsApp.
      </p>

      <div className="sticky top-[68px] z-20 -mx-4 mt-6 overflow-x-auto border-y border-white/8 bg-[#121212]/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-full md:border md:px-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${
              filter === 'all' ? 'bg-[#f5a623] text-[#121212]' : 'bg-white/5 text-white/70'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setFilter(c.id);
                setOpenCats((prev) => (prev.includes(c.id) ? prev : [...prev, c.id]));
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                filter === c.id ? 'bg-[#f5a623] text-[#121212]' : 'bg-white/5 text-white/70'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-3xl bg-[#1e1e1e]" />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {visible.map((cat) => {
            const list = grouped[cat.id] || [];
            if (!list.length) return null;
            const open = openCats.includes(cat.id);
            return (
              <section key={cat.id} className="overflow-hidden rounded-3xl border border-white/8 bg-[#161616]">
                <button
                  type="button"
                  onClick={() => toggle(cat.id)}
                  className="flex w-full items-center justify-between px-5 py-4"
                >
                  <h2 className="font-display text-3xl text-white">{cat.label}</h2>
                  <ChevronDown className={`text-[#f5a623] transition ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="grid gap-3 border-t border-white/8 p-3 sm:grid-cols-2">
                    {list.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActive(item)}
                        className="flex gap-3 rounded-2xl bg-[#1e1e1e] p-3 text-left transition hover:bg-[#242424]"
                      >
                        <img src={item.image_url} alt={item.name} className="h-24 w-24 shrink-0 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-white">{item.name}</h3>
                            {item.badge && (
                              <span className="shrink-0 rounded-full bg-[#f5a623] px-2 py-0.5 text-[9px] font-bold uppercase text-[#121212]">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-[#8e8e93]">{item.ingredients}</p>
                          <p className="mt-2 text-sm font-bold text-[#f5a623]">
                            {item.variants.length > 1
                              ? item.variants.map((v) => `${v.name} ${pkr(v.price)}`).join(' \u00b7 ')
                              : pkr(item.variants[0]?.price || 0)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {active && <ItemModal item={active} modifiers={modifiers} onClose={() => setActive(null)} />}
    </div>
  );
}
