import type { Metadata } from "next";
import { Anton, Archivo_Black, Hanken_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/components/auth/AuthProvider";

// Display / logo — tall condensed caps (hero + wordmark)
const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
  display: "swap",
});

// Section headings — heavy grotesque
const archivo = Archivo_Black({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-archivo",
  display: "swap",
});

// Body & UI
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

// Labels & specs (UPPERCASE, tracked)
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Snabbtryck — Designa din egen tröja",
  description:
    "Ladda upp din logga, placera den på plagget och se priset live per cm² tryckyta. DTF-tryck, inga uppläggsavgifter, från 1 plagg — tryckt och skickat inom 48 timmar.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv">
      <body
        className={`${anton.variable} ${archivo.variable} ${hanken.variable} ${spaceMono.variable}`}
      >
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
