import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { PWARegister } from "@/components/PWARegister";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://brycoach.pro";
const title = "Bryan Henao Martínez | Entrenador Personal";
const description = "Entrenador personal especializado en hipertrofia, pérdida de grasa, recomposición corporal, biomecánica, técnica y prevención de lesiones.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Bry Coach",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Bry Coach" },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/icons/icon-192.svg", type: "image/svg+xml" }, { url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/apple-touch-icon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
  authors: [{ name: "Bryan Henao Martínez" }],
  creator: "Bryan Henao Martínez",
  publisher: "Bryan Henao Martínez",
  keywords: ["Bryan Henao Martínez", "entrenador personal", "coach fitness", "hipertrofia", "recomposición corporal", "pérdida de grasa", "biomecánica", "prevención de lesiones", "entrenamiento personalizado"],
  openGraph: { type: "website", locale: "es_CO", url: siteUrl, siteName: "Bry Coach", title, description, images: [{ url: "https://app.brycoach.pro/og-bryancoach-programandoweb.jpg", width: 1672, height: 941, alt: "Bryan Henao Martínez, entrenador personal" }] },
  twitter: { card: "summary_large_image", title, description, images: ["https://app.brycoach.pro/og-bryancoach-programandoweb.jpg"] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0b1207", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body className={`${inter.variable} ${spaceGrotesk.variable}`}>{children}<PWARegister /></body></html>;
}
