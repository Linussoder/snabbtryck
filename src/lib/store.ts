"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { Garment, getGarment, ViewKey } from "./garments";
import { computePrice, PriceBreakdown } from "./pricing";

export type ElementType = "image" | "text" | "emoji";

interface BaseEl {
  id: string;
  type: ElementType;
  view: ViewKey;
  x: number; // normaliserat centrum 0..1 (av plaggets bredd/höjd)
  y: number;
  w: number; // normaliserad bredd 0..1 av plaggets bredd
  ar: number; // höjd/bredd-förhållande (canvas-px)
  rotation: number; // grader
}

export interface ImageEl extends BaseEl {
  type: "image";
  src: string;
  naturalW: number;
  naturalH: number;
  bgRemoved: boolean;
  aiGenerated?: boolean;
}

export interface TextEl extends BaseEl {
  type: "text";
  text: string;
  font: string; // DesignFont.name
  color: string;
  stroke: string; // konturfärg
  strokeW: number; // 0..8
  curve: number; // -100..100 bågform
  lineHeight: number;
}

export interface EmojiEl extends BaseEl {
  type: "emoji";
  char: string;
}

export type DesignElement = ImageEl | TextEl | EmojiEl;

export interface DesignSnapshot {
  id: string;
  name: string;
  garmentId: string;
  colorIndex: number;
  size: string;
  qty: number;
  elements: DesignElement[];
  updatedAt: number;
}

interface EditorState {
  garmentId: string;
  colorIndex: number;
  size: string;
  qty: number;
  view: ViewKey;
  elements: DesignElement[];
  selectedId: string | null;
  designId: string | null;
  designName: string;
  past: DesignElement[][];
  future: DesignElement[][];

  // derived
  garment: () => Garment;
  selected: () => DesignElement | null;
  printAreaCm2: () => number;
  price: () => PriceBreakdown;
  serialize: () => DesignSnapshot;
  setName: (n: string) => void;

  // actions
  setGarment: (id: string) => void;
  setColor: (i: number) => void;
  setSize: (s: string) => void;
  setQty: (n: number) => void;
  setView: (v: ViewKey) => void;
  select: (id: string | null) => void;
  addImage: (src: string, naturalW: number, naturalH: number, ai?: boolean) => void;
  addText: (text?: string) => void;
  addEmoji: (char: string) => void;
  updateEl: (id: string, patch: Partial<DesignElement>) => void;
  removeEl: (id: string) => void;
  duplicate: (id: string) => void;
  moveLayer: (id: string, dir: "up" | "down") => void;
  clearAll: () => void;
  loadSnapshot: (s: DesignSnapshot) => void;
  undo: () => void;
  redo: () => void;
}

export function uid(prefix = "el"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/* Derived hooks — beräknas via useMemo så inga färska objekt returneras
   från selectorn (undviker React getSnapshot-varningen). */
export function usePrice(): PriceBreakdown {
  const garmentId = useEditor((s) => s.garmentId);
  const elements = useEditor((s) => s.elements);
  const qty = useEditor((s) => s.qty);
  return useMemo(() => {
    const g = getGarment(garmentId);
    return computePrice(g, computePrintArea(elements, g), qty);
  }, [garmentId, elements, qty]);
}

export function usePrintArea(): number {
  const garmentId = useEditor((s) => s.garmentId);
  const elements = useEditor((s) => s.elements);
  return useMemo(
    () => computePrintArea(elements, getGarment(garmentId)),
    [garmentId, elements]
  );
}

const MAX_HISTORY = 40;

/** Tryckyta (cm²) för ett plagg = summa av elementens bounding-box. */
export function computePrintArea(
  elements: DesignElement[],
  garment: Garment
): number {
  let total = 0;
  for (const el of elements) {
    const wcm = el.w * garment.printRefWidthCm;
    const hcm = wcm * el.ar;
    // text/emoji fyller inte hela sin box → skala ner något
    const fill = el.type === "image" ? 1 : el.type === "emoji" ? 0.78 : 0.62;
    total += wcm * hcm * fill;
  }
  return Math.round(total);
}

export const useEditor = create<EditorState>((set, get) => {
  const commit = (updater: (els: DesignElement[]) => DesignElement[]) => {
    const cur = get().elements;
    const next = updater(cur);
    set({
      elements: next,
      past: [...get().past.slice(-MAX_HISTORY + 1), cur],
      future: [],
    });
  };

  return {
    garmentId: "tshirt",
    colorIndex: 0,
    size: "M",
    qty: 1,
    view: "front",
    elements: [],
    selectedId: null,
    designId: null,
    designName: "Namnlös design",
    past: [],
    future: [],

    garment: () => getGarment(get().garmentId),
    selected: () => get().elements.find((e) => e.id === get().selectedId) ?? null,
    printAreaCm2: () => computePrintArea(get().elements, getGarment(get().garmentId)),
    price: () =>
      computePrice(
        getGarment(get().garmentId),
        computePrintArea(get().elements, getGarment(get().garmentId)),
        get().qty
      ),
    serialize: () => {
      const s = get();
      return {
        id: s.designId ?? uid("dsn"),
        name: s.designName,
        garmentId: s.garmentId,
        colorIndex: s.colorIndex,
        size: s.size,
        qty: s.qty,
        elements: s.elements,
        updatedAt: Date.now(),
      };
    },
    setName: (n) => set({ designName: n }),

    setGarment: (id) => {
      const g = getGarment(id);
      set({
        garmentId: id,
        colorIndex: 0,
        size: g.sizes.includes(get().size) ? get().size : g.sizes[0],
        view: g.views.includes(get().view) ? get().view : g.views[0],
      });
    },
    setColor: (i) => set({ colorIndex: i }),
    setSize: (s) => set({ size: s }),
    setQty: (n) => set({ qty: Math.max(1, Math.min(9999, Math.round(n))) }),
    setView: (v) => set({ view: v, selectedId: null }),
    select: (id) => set({ selectedId: id }),

    addImage: (src, naturalW, naturalH, ai) => {
      const id = uid("img");
      const ar = naturalH / naturalW;
      commit((els) => [
        ...els,
        {
          id,
          type: "image",
          view: get().view,
          x: 0.5,
          y: 0.45,
          w: 0.24,
          ar,
          rotation: 0,
          src,
          naturalW,
          naturalH,
          bgRemoved: false,
          aiGenerated: ai,
        } as ImageEl,
      ]);
      set({ selectedId: id });
    },

    addText: (text = "DIN TEXT") => {
      const id = uid("txt");
      commit((els) => [
        ...els,
        {
          id,
          type: "text",
          view: get().view,
          x: 0.5,
          y: 0.4,
          w: 0.34,
          ar: 0.28,
          rotation: 0,
          text,
          font: "Anton",
          color: "#ffffff",
          stroke: "#0a0a0a",
          strokeW: 0,
          curve: 0,
          lineHeight: 1.05,
        } as TextEl,
      ]);
      set({ selectedId: id });
    },

    addEmoji: (char) => {
      const id = uid("emo");
      commit((els) => [
        ...els,
        {
          id,
          type: "emoji",
          view: get().view,
          x: 0.5,
          y: 0.42,
          w: 0.16,
          ar: 1,
          rotation: 0,
          char,
        } as EmojiEl,
      ]);
      set({ selectedId: id });
    },

    updateEl: (id, patch) =>
      set((st) => ({
        elements: st.elements.map((e) =>
          e.id === id ? ({ ...e, ...patch } as DesignElement) : e
        ),
      })),

    removeEl: (id) => {
      commit((els) => els.filter((e) => e.id !== id));
      if (get().selectedId === id) set({ selectedId: null });
    },

    duplicate: (id) => {
      const src = get().elements.find((e) => e.id === id);
      if (!src) return;
      const nid = uid(src.type.slice(0, 3));
      commit((els) => [
        ...els,
        { ...src, id: nid, x: Math.min(0.85, src.x + 0.05), y: Math.min(0.85, src.y + 0.05) },
      ]);
      set({ selectedId: nid });
    },

    moveLayer: (id, dir) =>
      commit((els) => {
        const i = els.findIndex((e) => e.id === id);
        if (i < 0) return els;
        const j = dir === "up" ? i + 1 : i - 1;
        if (j < 0 || j >= els.length) return els;
        const copy = [...els];
        [copy[i], copy[j]] = [copy[j], copy[i]];
        return copy;
      }),

    clearAll: () => commit(() => []),

    loadSnapshot: (s) =>
      set({
        garmentId: s.garmentId,
        colorIndex: s.colorIndex,
        size: s.size,
        qty: s.qty,
        elements: s.elements,
        designId: s.id,
        designName: s.name,
        selectedId: null,
        past: [],
        future: [],
        view: getGarment(s.garmentId).views[0],
      }),

    undo: () => {
      const { past, elements, future } = get();
      if (!past.length) return;
      const prev = past[past.length - 1];
      set({
        elements: prev,
        past: past.slice(0, -1),
        future: [elements, ...future].slice(0, MAX_HISTORY),
        selectedId: null,
      });
    },
    redo: () => {
      const { future, elements, past } = get();
      if (!future.length) return;
      const next = future[0];
      set({
        elements: next,
        future: future.slice(1),
        past: [...past, elements].slice(-MAX_HISTORY),
        selectedId: null,
      });
    },
  };
});
