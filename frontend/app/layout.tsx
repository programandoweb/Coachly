import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PWARegister } from '@/components/PWARegister';
import { AppSplashScreen } from '@/components/AppSplashScreen';

const seoTitle = 'Coachly | Gestión inteligente para entrenadores';
const seoDescription =
  'Coachly centraliza clientes, rutinas, mediciones, progreso y seguimiento para entrenadores personales y coaches fitness.';
const seoImage = '/og-bryancoach-programandoweb.jpg';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: seoTitle,
    template: '%s | Coachly',
  },
  description: seoDescription,
  applicationName: 'Coachly',
  manifest: '/manifest.webmanifest',
  authors: [{ name: 'Coachly' }],
  creator: 'Coachly',
  publisher: 'Coachly',
  keywords: [
    'software para entrenadores',
    'entrenador personal',
    'gestión de clientes fitness',
    'rutinas de entrenamiento',
    'seguimiento de progreso',
    'mediciones corporales',
    'personal trainer software',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: appUrl,
    title: seoTitle,
    description: seoDescription,
    siteName: 'Coachly',
    images: [{ url: seoImage, width: 1672, height: 941, alt: 'Coachly - plataforma para entrenadores' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoTitle,
    description: seoDescription,
    images: [seoImage],
  },
  appleWebApp: {
    capable: true,
    title: 'Coachly',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [{ url: '/icons/coachly.svg', type: 'image/svg+xml' }],
    shortcut: '/icons/coachly.svg',
  },
  formatDetection: { telephone: false, email: false, address: false },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0b10',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <PWARegister />
        <AppSplashScreen />
        <main className="app-root">{children}</main>
      </body>
    </html>
  );
}
