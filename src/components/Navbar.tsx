import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import type { StoreStatus } from '../lib/types';

const links = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/find-us', label: 'Find Us' },
];

export default function Navbar({ status }: { status: StoreStatus | null }) {
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobile(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled || mobile ? 'bg-[#121212]/92 backdrop-blur-xl border-b border-white/8' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5a623] text-[#121212] shadow-[0_0_22px_rgba(245,166,35,0.45)]">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
              <path d="M4 10.2C4 8 8 6.4 12 6.4s8 1.6 8 3.8v.7H4v-.7z" />
              <path d="M3.6 12.2c1.8 1.4 4.8 2 8.4 2s6.6-.6 8.4-2l-.7 1.8c-1.4.9-4 1.5-7.7 1.5s-6.3-.6-7.7-1.5l-.7-1.8z" />
              <path d="M4.4 15.2C5.6 17.4 8.2 19 12 19s6.4-1.6 7.6-3.8v1.6C18.4 19.2 15.6 21 12 21s-6.4-1.8-7.6-4.2v-1.6z" />
            </svg>
          </span>
          <span className="leading-none">
            <span className="block font-display text-[1.55rem] tracking-wide text-white">BUZZ SMASH</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f5a623]">Faisalabad</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-semibold uppercase tracking-[0.16em] transition ${
                  isActive ? 'text-[#f5a623]' : 'text-white/75 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {status && (
            <span
              className={`hidden items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide lg:inline-flex ${
                status.open
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                  : 'border-white/10 bg-white/5 text-white/60'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${
                status.open ? 'bg-emerald-400 animate-pulse' : 'bg-white/40'
              }`} />
              {status.open ? 'Open Now' : 'Closed'}
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-[#f5a623]/50 hover:text-[#f5a623]"
            aria-label="Open cart"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#f5a623] px-1 text-[11px] font-bold text-[#121212]">
                {count}
              </span>
            )}
          </button>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white md:hidden"
            onClick={() => setMobile((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobile ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobile && (
        <div className="border-t border-white/8 bg-[#121212] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-3 text-sm font-semibold uppercase tracking-[0.16em] ${
                    isActive ? 'bg-[#f5a623] text-[#121212]' : 'text-white/80'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
