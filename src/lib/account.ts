"use client";

import { DesignSnapshot, uid } from "./store";

// Lokal "backend" via localStorage för designs/varukorg/ordrar.
// Auth flyttad till Supabase (se lib/supabase/* + components/auth/AuthProvider).
// Ordrar migreras till Supabase i Fas 1.

export type OrderStatus = "Mottagen" | "I tryck" | "Skickad";

export interface OrderLine {
  garmentId: string;
  colorIndex: number;
  size: string;
  qty: number;
  name?: string; // lagtryck: namn
  number?: string; // lagtryck: nummer
}

export interface Order {
  id: string;
  ref: string; // ordernr synligt för kund
  createdAt: number;
  status: OrderStatus;
  total: number;
  design: DesignSnapshot;
  lines: OrderLine[];
  business: boolean;
}

const DESIGNS_KEY = "tryck_designs";
const ORDERS_KEY = "tryck_orders";
const SHARED_KEY = "tryck_shared"; // delade designs via länk

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, val: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
  window.dispatchEvent(new Event("tryck-store"));
}

/* ---------------- Designs ---------------- */
export function getDesigns(): DesignSnapshot[] {
  return read<DesignSnapshot[]>(DESIGNS_KEY, []).sort(
    (a, b) => b.updatedAt - a.updatedAt
  );
}
export function saveDesign(d: DesignSnapshot): DesignSnapshot {
  const all = read<DesignSnapshot[]>(DESIGNS_KEY, []);
  const i = all.findIndex((x) => x.id === d.id);
  const rec = { ...d, updatedAt: Date.now() };
  if (i >= 0) all[i] = rec;
  else all.push(rec);
  write(DESIGNS_KEY, all);
  return rec;
}
export function deleteDesign(id: string) {
  write(
    DESIGNS_KEY,
    read<DesignSnapshot[]>(DESIGNS_KEY, []).filter((d) => d.id !== id)
  );
}
export function getDesign(id: string): DesignSnapshot | null {
  return read<DesignSnapshot[]>(DESIGNS_KEY, []).find((d) => d.id === id) ?? null;
}

/* ---------------- Delade länkar ---------------- */
export function shareDesign(d: DesignSnapshot): string {
  const token = uid("share");
  const all = read<Record<string, DesignSnapshot>>(SHARED_KEY, {});
  all[token] = { ...d };
  write(SHARED_KEY, all);
  return token;
}
export function getShared(token: string): DesignSnapshot | null {
  return read<Record<string, DesignSnapshot>>(SHARED_KEY, {})[token] ?? null;
}

/* ---------------- Varukorg ---------------- */
const CART_KEY = "tryck_cart";
export interface CartAddon {
  id: string;
  garmentId: string;
  colorIndex: number;
  size: string;
  qty: number;
}
export interface Cart {
  design: DesignSnapshot;
  qty: number;
  addons?: CartAddon[];
}
export function setCart(cart: Cart) {
  write(CART_KEY, cart);
}
export function getCart(): Cart | null {
  return read<Cart | null>(CART_KEY, null);
}
export function clearCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("tryck-store"));
}

/* ---------------- Orders ---------------- */
export function getOrders(): Order[] {
  return read<Order[]>(ORDERS_KEY, []).sort((a, b) => b.createdAt - a.createdAt);
}
export function createOrder(o: Omit<Order, "id" | "createdAt" | "status" | "ref">): Order {
  const all = read<Order[]>(ORDERS_KEY, []);
  const order: Order = {
    ...o,
    id: uid("ord"),
    ref: "TR-" + Math.floor(100000 + Math.random() * 899999),
    createdAt: Date.now(),
    status: "Mottagen",
  };
  all.push(order);
  write(ORDERS_KEY, all);
  return order;
}
export function getOrder(id: string): Order | null {
  return read<Order[]>(ORDERS_KEY, []).find((o) => o.id === id) ?? null;
}
export function setOrderStatus(id: string, status: OrderStatus) {
  const all = read<Order[]>(ORDERS_KEY, []);
  const i = all.findIndex((o) => o.id === id);
  if (i >= 0) {
    all[i].status = status;
    write(ORDERS_KEY, all);
  }
}
