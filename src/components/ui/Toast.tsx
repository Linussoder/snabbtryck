"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type ToastKind = "info" | "success" | "warn" | "error";
interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  msg?: string;
}

interface ToastCtx {
  push: (t: Omit<ToastItem, "id">) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast must be used inside ToastProvider");
  return c;
}

const ACCENT: Record<ToastKind, string> = {
  info: "var(--color-ink)",
  success: "var(--color-good)",
  warn: "var(--color-warn)",
  error: "var(--color-bad)",
};
const MARK: Record<ToastKind, string> = {
  info: "i",
  success: "✓",
  warn: "!",
  error: "×",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, 4200);
  }, []);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 w-[min(92vw,360px)]">
        {items.map((t) => (
          <div
            key={t.id}
            className="toast-in card crop-frame flex items-start gap-3 p-3 shadow-lg"
            style={{ borderLeft: `4px solid ${ACCENT[t.kind]}` }}
            role="status"
          >
            <span
              className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: ACCENT[t.kind] }}
            >
              {MARK[t.kind]}
            </span>
            <div className="min-w-0">
              <p className="font-display uppercase tracking-wide text-sm leading-tight">
                {t.title}
              </p>
              {t.msg && (
                <p className="text-[13px] text-muted leading-snug mt-0.5">
                  {t.msg}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

/** Liten hook som lyssnar på localStorage-ändringar (account/designs). */
export function useStoreTick() {
  const [, force] = useState(0);
  useEffect(() => {
    const h = () => force((n) => n + 1);
    window.addEventListener("tryck-store", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("tryck-store", h);
      window.removeEventListener("storage", h);
    };
  }, []);
}
