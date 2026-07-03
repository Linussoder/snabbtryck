"use client";

// Lead-capture för bulkpris-kalkylatorn. Skickar till /api/lead (stubbat →
// koppla CRM/n8n/Supabase där). Sparar även lokalt för demo/överblick.

export interface Lead {
  email: string;
  company?: string;
  garmentId: string;
  qty: number;
  estimate: number;
  logo?: boolean;
  createdAt: number;
}

const LEADS_KEY = "tryck_leads";

export async function submitLead(lead: Omit<Lead, "createdAt">): Promise<boolean> {
  const rec: Lead = { ...lead, createdAt: Date.now() };
  try {
    if (typeof window !== "undefined") {
      const all: Lead[] = JSON.parse(localStorage.getItem(LEADS_KEY) ?? "[]");
      all.push(rec);
      localStorage.setItem(LEADS_KEY, JSON.stringify(all));
    }
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rec),
    });
    return res.ok;
  } catch {
    return false;
  }
}
