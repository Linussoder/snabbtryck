import type { Metadata, Viewport } from "next";
import { Anton, Archivo_Black, Hanken_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SettingsProvider } from "@/components/settings/SettingsProvider";
import { CookieBanner } from "@/components/CookieBanner";
import { SITE, organizationLd, websiteLd, jsonLdGraph } from "@/lib/seo";

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
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} – ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "DTF-tryck",
    "designa egen tröja",
    "trycka kläder",
    "egen t-shirt med tryck",
    "trycka logga på tröja",
    "lagtröjor med namn och nummer",
    "matchtröjor",
    "föreningskläder",
    "profilkläder företag",
    "texttryck kläder",
    "hoodie med eget tryck",
    "keps med tryck",
    "beställa tröjor med tryck",
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} – ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} – ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "shopping",
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#111114",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={SITE.lang}>
      <body
        className={`${anton.variable} ${archivo.variable} ${hanken.variable} ${spaceMono.variable}`}
      >
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: jsonLdGraph([organizationLd(), websiteLd()]),
          }}
        />
        <AuthProvider>
          <SettingsProvider>
            <ToastProvider>
              {children}
              <CookieBanner />
            </ToastProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
