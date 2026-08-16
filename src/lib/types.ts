export type MenuVariant = {
  id: number;
  item_id: number;
  name: string;
  price: number;
  sort_order: number;
};

export type MenuItem = {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  ingredients: string;
  image_url: string;
  badge: string | null;
  is_featured: boolean;
  is_available: boolean;
  allows_meal: boolean;
  sort_order: number;
  variants: MenuVariant[];
};

export type Modifier = {
  id: number;
  name: string;
  price: number;
  kind: string;
  applies_to: string;
  sort_order: number;
};

export type DeliveryZone = {
  id: number;
  name: string;
  fee: number;
  is_active: boolean;
  sort_order: number;
};

export type CartModifier = {
  id: number;
  name: string;
  price: number;
};

export type CartLine = {
  uid: string;
  item_id: number;
  name: string;
  image_url: string;
  variant_name: string;
  variant_price: number;
  modifiers: CartModifier[];
  meal: boolean;
  meal_price: number;
  qty: number;
  notes: string;
};

export type StoreStatus = {
  open: boolean;
  label: string;
  timezone: string;
  weekdayHours: string;
  weekendHours: string;
};

export type Review = {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  neighborhood: string;
  created_at: string;
};

export type InstagramPost = {
  id: number;
  image_url: string;
  caption: string;
  likes: number;
  posted_at: string;
};

export type SettingsMap = Record<string, string>;
