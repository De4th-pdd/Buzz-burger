import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartLine, CartModifier } from '../lib/types';
import { cartSubtotal, lineTotal } from '../lib/format';

const STORAGE_KEY = 'buzz-smash-cart';

type AddPayload = {
  item_id: number;
  name: string;
  image_url: string;
  variant_name: string;
  variant_price: number;
  modifiers: CartModifier[];
  meal: boolean;
  meal_price: number;
  notes?: string;
};

type CartContextValue = {
  items: CartLine[];
  count: number;
  subtotal: number;
  addItem: (payload: AddPayload) => void;
  updateQty: (uid: string, qty: number) => void;
  removeItem: (uid: string) => void;
  clearCart: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (payload: AddPayload) => {
    setItems((prev) => {
      const key = JSON.stringify({
        item_id: payload.item_id,
        variant_name: payload.variant_name,
        modifiers: payload.modifiers.map((m) => m.id).sort(),
        meal: payload.meal,
        notes: payload.notes || '',
      });
      const match = prev.find(
        (l) =>
          JSON.stringify({
            item_id: l.item_id,
            variant_name: l.variant_name,
            modifiers: l.modifiers.map((m) => m.id).sort(),
            meal: l.meal,
            notes: l.notes || '',
          }) === key,
      );
      if (match) {
        return prev.map((l) => (l.uid === match.uid ? { ...l, qty: l.qty + 1 } : l));
      }
      return [
        ...prev,
        {
          uid: uid(),
          item_id: payload.item_id,
          name: payload.name,
          image_url: payload.image_url,
          variant_name: payload.variant_name,
          variant_price: payload.variant_price,
          modifiers: payload.modifiers,
          meal: payload.meal,
          meal_price: payload.meal_price,
          qty: 1,
          notes: payload.notes || '',
        },
      ];
    });
    setOpen(true);
  };

  const updateQty = (lineUid: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((l) => l.uid !== lineUid);
      return prev.map((l) => (l.uid === lineUid ? { ...l, qty } : l));
    });
  };

  const removeItem = (lineUid: string) => {
    setItems((prev) => prev.filter((l) => l.uid !== lineUid));
  };

  const clearCart = () => setItems([]);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((s, l) => s + l.qty, 0),
      subtotal: cartSubtotal(items),
      addItem,
      updateQty,
      removeItem,
      clearCart,
      open,
      setOpen,
    }),
    [items, open],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function lineAmount(line: CartLine) {
  return lineTotal(line);
}
