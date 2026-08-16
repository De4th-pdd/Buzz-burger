export function pkr(n: number) {
  return `PKR ${Number(n || 0).toLocaleString('en-PK')}`;
}

export function lineUnit(line: {
  variant_price: number;
  modifiers: { price: number }[];
  meal: boolean;
  meal_price: number;
}) {
  const mods = line.modifiers.reduce((s, m) => s + (m.price || 0), 0);
  return line.variant_price + mods + (line.meal ? line.meal_price : 0);
}

export function lineTotal(line: {
  variant_price: number;
  modifiers: { price: number }[];
  meal: boolean;
  meal_price: number;
  qty: number;
}) {
  return lineUnit(line) * line.qty;
}

export function cartSubtotal(
  lines: {
    variant_price: number;
    modifiers: { price: number }[];
    meal: boolean;
    meal_price: number;
    qty: number;
  }[],
) {
  return lines.reduce((s, l) => s + lineTotal(l), 0);
}
