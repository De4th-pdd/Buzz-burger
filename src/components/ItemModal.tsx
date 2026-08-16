import { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import type { MenuItem, Modifier } from '../lib/types';
import { pkr } from '../lib/format';
import { useCart } from '../contexts/CartContext';

const MEAL_PRICE = 350;

export default function ItemModal({
  item,
  modifiers,
  onClose,
}: {
  item: MenuItem;
  modifiers: Modifier[];
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const [variantId, setVariantId] = useState(item.variants[0]?.id);
  const [selected, setSelected] = useState<number[]>([]);
  const [meal, setMeal] = useState(false);
  const [notes, setNotes] = useState('');

  const variant = item.variants.find((v) => v.id === variantId) || item.variants[0];
  const applicable = modifiers.filter(
    (m) => m.applies_to === 'all' || m.applies_to === item.category || m.applies_to === item.slug,
  );

  const extras = useMemo(
    () => applicable.filter((m) => selected.includes(m.id)),
    [applicable, selected],
  );

  const total =
    (variant?.price || 0) +
    extras.reduce((s, m) => s + m.price, 0) +
    (meal && item.allows_meal ? MEAL_PRICE : 0);

  const toggle = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const add = () => {
    if (!variant) return;
    addItem({
      item_id: item.id,
      name: item.name,
      image_url: item.image_url,
      variant_name: variant.name,
      variant_price: variant.price,
      modifiers: extras.map((m) => ({ id: m.id, name: m.name, price: m.price })),
      meal: meal && item.allows_meal,
      meal_price: MEAL_PRICE,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center md:items-center">
      <button type="button" className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-white/10 bg-[#161616] md:rounded-3xl">
        <div className="relative h-56">
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-black/20" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 pb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              {item.badge && (
                <span className="mb-1 inline-block rounded-full bg-[#f5a623] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#121212]">
                  {item.badge}
                </span>
              )}
              <h3 className="font-display text-4xl text-white">{item.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#8e8e93]">{item.ingredients}</p>
            </div>
          </div>

          {item.variants.length > 1 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8e8e93]">Size</p>
              <div className="grid grid-cols-3 gap-2">
                {item.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariantId(v.id)}
                    className={`rounded-2xl border px-3 py-3 text-left transition ${
                      variantId === v.id
                        ? 'border-[#f5a623] bg-[#f5a623]/12 text-white'
                        : 'border-white/10 bg-white/3 text-white/80'
                    }`}
                  >
                    <span className="block text-sm font-bold">{v.name}</span>
                    <span className="text-xs text-[#f5a623]">{pkr(v.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {item.allows_meal && (
            <button
              type="button"
              onClick={() => setMeal((v) => !v)}
              className={`mt-5 flex w-full items-center justify-between rounded-2xl border px-4 py-3 ${
                meal ? 'border-[#f5a623] bg-[#f5a623]/12' : 'border-white/10 bg-white/3'
              }`}
            >
              <span>
                <span className="block text-sm font-bold">Make it a Meal</span>
                <span className="text-xs text-[#8e8e93]">Classic fries + drink</span>
              </span>
              <span className="text-sm font-bold text-[#f5a623]">+ {pkr(MEAL_PRICE)}</span>
            </button>
          )}

          {applicable.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8e8e93]">Modifiers</p>
              <div className="space-y-2">
                {applicable.map((m) => {
                  const on = selected.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggle(m.id)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                        on ? 'border-[#f5a623] bg-[#f5a623]/10' : 'border-white/10 bg-white/3'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <span
                          className={`grid h-5 w-5 place-items-center rounded-md ${
                            on ? 'bg-[#f5a623] text-[#121212]' : 'bg-white/10 text-transparent'
                          }`}
                        >
                          <Check size={12} />
                        </span>
                        {m.name}
                      </span>
                      <span className="text-xs font-semibold text-[#8e8e93]">
                        {m.price > 0 ? `+ ${pkr(m.price)}` : 'Free'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#8e8e93]">Kitchen note</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="No pickles, extra sauce..."
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#f5a623]"
            />
          </label>

          <button
            type="button"
            onClick={add}
            className="mt-5 w-full rounded-full bg-[#f5a623] py-3.5 font-display text-2xl tracking-wide text-[#121212]"
          >
            ADD \u00b7 {pkr(total)}
          </button>
        </div>
      </div>
    </div>
  );
}
