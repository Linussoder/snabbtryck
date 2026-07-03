/** Delad, klient-säker typ. Matchar `profiles`-tabellen. */
export interface Profile {
  id: string;
  email: string;
  name: string;
  business: boolean;
  company_name: string | null;
  org_nr: string | null;
  role: "customer" | "admin";
}
