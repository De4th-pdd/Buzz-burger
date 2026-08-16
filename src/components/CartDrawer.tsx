import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { pkr } from '../lib/format';
import { lineAmount } from '../contexts/CartContext';

export default function CartDrawer() {
  const { items, subtotal, updateQty, removeItem, open, setOpen } = useCart();
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-label="Close cart"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#161616] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div>
            <p className="font-display text-3xl text-white">Your Smash</p>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8e8e93]">{items.length} item{items.length === 1 ? '' : 's'}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-3 text-[#f5a623]" size={36} />
              <p className="font-display text-3xl">Cart is empty</p>
              <p className="mt-1 text-sm text-[#8e8e93]">Smash something. Your future self will thank you.</p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate('/menu');
                }}
                className="mt-5 rounded-full bg-[#f5a623] px-5 py-2.5 text-sm font-bold text-[#121212]"
              >
                Browse menu
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((line) => (
                <li key={line.uid} className="flex gap-3 rounded-2xl border border-white/8 bg-[#1e1e1e] p-3">
                  <img src={line.image_url} alt={line.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="truncate font-semibold text-white">{line.name}</p>
                        <p className="text-xs text-[#f5a623]">{line.variant_name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(line.uid)}
                        className="text-[#8e8e93] hover:text-red-400"
                        aria-label="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    {line.modifiers.length > 0 && (
                      <p className="mt-1 truncate text-[11px] text-[#8e8e93]">
                        {line.modifiers.map((m) => m.name).join(', ')}
                      </p>
                    )}
                    {line.meal && <p className="text-[11px] text-[#8e8e93]">+ Meal (fries & drink)</p>}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full bg-black/40 p-1">
                        <button
                          type="button"
                          className="grid h-7 w-7 place-items-center rounded-full bg-white/8"
                          onClick={() => updateQty(line.uid, line.qty - 1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-4 text-center text-sm font-bold">{line.qty}</span>
                        <button
                          type="button"
                          className="grid h-7 w-7 place-items-center rounded-full bg-white/8"
                          onClick={() => updateQty(line.uid, line.qty + 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-white">{pkr(lineAmount(line))}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-white/8 p-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-[#8e8e93]">Subtotal</span>
              <span className="font-display text-3xl text-white">{pkr(subtotal)}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/checkout');
              }}
              className="w-full rounded-full bg-[#f5a623] py-3.5 font-display text-2xl tracking-wide text-[#121212] shadow-[0_8px_30px_rgba(245,166,35,0.35)]"
            >
              CHECKOUT
            </button>
            <p className="mt-2 text-center text-[11px] text-[#8e8e93]">Delivery fee calculated at checkout</p>
          </div>
        )}
      </aside>
    </div>
  );
}
