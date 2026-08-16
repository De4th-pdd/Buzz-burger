import { Link } from 'react-router-dom';
import { Clock, Instagram, MapPin, Phone } from 'lucide-react';
import type { SettingsMap, StoreStatus } from '../lib/types';

export default function Footer({
  settings,
  status,
}: {
  settings: SettingsMap;
  status: StoreStatus | null;
}) {
  const phone = settings.phone || '0321-4567890';
  const wa = (settings.whatsapp_number || '923214567890').replace(/\D/g, '');

  return (
    <footer className="border-t border-white/8 bg-[#0c0c0c] pb-28 pt-14">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-4 md:px-6">
        <div className="md:col-span-1">
          <p className="font-display text-4xl text-white">BUZZ SMASH</p>
          <p className="mt-2 text-sm leading-relaxed text-[#8e8e93]">
            Faisalabad's finest smash, smashed on a screaming-hot flat top and sent straight to your door.
          </p>
          <a
            href={`https://instagram.com/${(settings.instagram || 'buzzsmashburgers').replace('@', '')}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-[#f5a623]"
          >
            <Instagram size={16} /> @{settings.instagram || 'buzzsmashburgers'}
          </a>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#f5a623]">Find us</p>
          <p className="flex items-start gap-2 text-sm text-white/80">
            <MapPin size={16} className="mt-0.5 shrink-0 text-[#f5a623]" />
            {settings.address || 'Pearl City commercial hub, Sargodha Road, Faisalabad'}
          </p>
          <a href={`tel:${phone}`} className="mt-3 flex items-center gap-2 text-sm text-white/80">
            <Phone size={16} className="text-[#f5a623]" /> {phone}
          </a>
          <a href={`https://wa.me/${wa}`} className="mt-2 block text-sm text-[#f5a623]">
            WhatsApp order line
          </a>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#f5a623]">Hours</p>
          <p className="flex items-start gap-2 text-sm text-white/80">
            <Clock size={16} className="mt-0.5 shrink-0 text-[#f5a623]" />
            <span>
              Mon\u2013Thu: 5:00 PM \u2013 1:00 AM
              <br />
              Fri\u2013Sun: 5:00 PM \u2013 2:00 AM
            </span>
          </p>
          {status && (
            <p className={`mt-3 text-xs font-semibold ${
              status.open ? 'text-emerald-400' : 'text-white/50'
            }`}>{status.label}</p>
          )}
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#f5a623]">Kitchen</p>
          <div className="flex flex-col gap-2 text-sm text-white/75">
            <Link to="/menu" className="hover:text-white">Full menu</Link>
            <Link to="/find-us" className="hover:text-white">Delivery zones</Link>
            <Link to="/checkout" className="hover:text-white">Checkout</Link>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-white/8 px-4 pt-6 text-xs text-[#8e8e93] md:px-6">
        \u00a9 {new Date().getFullYear()} Buzz Smash Burgers \u00b7 Sargodha Road / Pearl City \u00b7 Smash burgers, loaded fries & late-night delivery in Faisalabad
      </div>
    </footer>
  );
}
