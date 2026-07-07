"use client";

import { useEditor } from "@/lib/store";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { saveDesign } from "@/lib/account";
import { saveDesignRemote } from "@/lib/designs-db";

/**
 * Delad spara-logik för editorn (PricePanel + spara-påminnelsen). Sparar till
 * kontot om inloggad, annars lokalt, och markerar designen som sparad så att
 * "osparade ändringar"-banderollen försvinner.
 */
export function useSaveDesign(): () => Promise<void> {
  const { user } = useAuth();
  const { push } = useToast();
  const serialize = useEditor((s) => s.serialize);
  const markSaved = useEditor((s) => s.markSaved);

  return async function save() {
    const snap = serialize();
    try {
      if (user) {
        await saveDesignRemote(snap);
        push({
          kind: "success",
          title: "Design sparad",
          msg: "Synkad till ditt konto — hittas under Mina skapelser.",
        });
      } else {
        saveDesign(snap);
        push({
          kind: "success",
          title: "Design sparad lokalt",
          msg: "Logga in för att spara den i ditt konto.",
        });
      }
      markSaved();
    } catch {
      push({ kind: "error", title: "Kunde inte spara", msg: "Försök igen." });
    }
  };
}
