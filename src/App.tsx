import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import StickyOrderButton from './components/StickyOrderButton';
import Home from './pages/Home';
import MenuPage from './pages/MenuPage';
import FindUs from './pages/FindUs';
import Checkout from './pages/Checkout';
import { computeLocalStatus } from './lib/hours';
import type { MenuItem, Modifier, SettingsMap, StoreStatus } from './lib/types';

export default function App() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [settings, setSettings] = useState<SettingsMap>({});
  const [status, setStatus] = useState<StoreStatus | null>(computeLocalStatus());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load menu');
      setItems(data.items || []);
      setModifiers(data.modifiers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setSettings(data);
      })
      .catch(() => {});
    fetch('/api/status')
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.open === 'boolean') setStatus(data);
      })
      .catch(() => setStatus(computeLocalStatus()));
  }, []);

  return (
    <BrowserRouter>
      <CartProvider>
        <div className="min-h-screen bg-[#121212] text-white">
          <Navbar status={status} />
          <Routes>
            <Route path="/" element={<Home items={items} modifiers={modifiers} status={status} loading={loading} />} />
            <Route
              path="/menu"
              element={<MenuPage items={items} modifiers={modifiers} loading={loading} error={error} />}
            />
            <Route path="/find-us" element={<FindUs settings={settings} status={status} />} />
            <Route path="/checkout" element={<Checkout settings={settings} status={status} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer settings={settings} status={status} />
          <CartDrawer />
          <StickyOrderButton />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
