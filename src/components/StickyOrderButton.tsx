import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function StickyOrderButton() {
  const { count, setOpen } = useCart();
  return (
    <div className="pointer-events-none fixed bottom-5 left-0 right-0 z-40 flex justify-center px-4 md:bottom-7">
      <div className="pointer-events-auto flex items-center gap-2">
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-6 py-3.5 font-display text-2xl tracking-wide text-[#121212] shadow-[0_10px_40px_rgba(245,166,35,0.45)] transition hover:bg-[#ffb800] hover:scale-[1.03]"
        >
          <Flame size={20} />
          ORDER NOW
        </Link>
        {count > 0 && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center rounded-full border border-[#f5a623]/40 bg-[#1e1e1e] px-4 py-3.5 text-sm font-bold text-[#f5a623] shadow-xl"
          >
            {count} in cart
          </button>
        )}
      </div>
    </div>
  );
}
