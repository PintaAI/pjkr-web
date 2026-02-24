import type { Metadata } from "next";
import { Architects_Daughter, Geist_Mono } from "next/font/google"; // Replaced Geist with Architects_Daughter
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { Toaster } from "sonner";

// Instantiate Architects Daughter for --font-sans
const architectsDaughter = Architects_Daughter({
  subsets: ['latin'],
  weight: ['400'], // Architects Daughter is typically available in 400 weight
  variable: '--font-sans', // This will be the CSS variable name
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono", // Keeping Geist Mono for monospaced text
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Hakgyo - LPK Korea & EPS-TOPIK Indonesia Terbaik | Belajar Bahasa Korea",
    template: "%s | Hakgyo"
  },
  description: "Hakgyo adalah LPK Korea murah dan terpercaya untuk persiapan EPS-TOPIK Indonesia. Platform belajar bahasa Korea lengkap dengan materi EPS-TOPIK, live session, dan komunitas aktif. Bergabung dengan 10.000+ siswa yang telah lulus EPS-TOPIK.",
  keywords: [
    "hakgyo",
    "EPS TOPIK Indonesia",
    "LPK Korea",
    "LPK murah",
    "LPK terbaik",
    "belajar bahasa Korea",
    "kursus bahasa Korea",
    "persiapan EPS-TOPIK",
    "latihan soal EPS-TOPIK",
    "tryout EPS-TOPIK",
    "Korean language learning",
    "belajar bahasa Korea online",
    "aplikasi belajar bahasa Korea",
    "les bahasa Korea",
    "belajar Korea gratis",
    "platform belajar bahasa Korea",
    "TOPIK preparation",
    "Korean vocabulary",
    "Korean grammar",
    "Korean language course",
    "Korean language learning platform",
    "Online Korean lessons",
    "Korean language tutoring",
    "Korean language app",
    "Study Korean",
    "Korean language school",
    "Korean conversation practice",
    "Korean reading practice",
    "Korean writing practice",
    "Learn Hangul",
    "Korean alphabet",
    "Korean language certification",
    "G2G Korea",
    "EPS TOPIK preparation Indonesia",
    "tempat les bahasa Korea",
    "tempat kursus bahasa Korea",
    "biro jasa EPS-TOPIK",
    "LPK Korea resmi",
    "LPK Korea terpercaya",
    "LPK Korea Jakarta",
    "LPK Korea Surabaya",
    "LPK Korea Bandung",
    "LPK Korea Medan"
  ],
  authors: [{ name: "Hakgyo" }],
  creator: "Hakgyo",
  publisher: "Hakgyo",
  applicationName: "Hakgyo",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://hakgyo.vercel.app'),
  category: 'education',
  classification: 'Education, Language Learning',
  referrer: 'origin-when-cross-origin',
  openGraph: {
    type: "website",
    locale: "id_ID",
    alternateLocale: ["en_US", "ko_KR"],
    url: "/",
    siteName: "Hakgyo",
    title: "Hakgyo - LPK Korea & EPS-TOPIK Indonesia Terbaik | Belajar Bahasa Korea",
    description: "Hakgyo adalah LPK Korea murah dan terpercaya untuk persiapan EPS-TOPIK Indonesia. Platform belajar bahasa Korea lengkap dengan materi EPS-TOPIK, live session, dan komunitas aktif.",
    images: [
      {
        url: "/logo/hakgyo-dark.png",
        width: 1200,
        height: 630,
        alt: "Hakgyo - LPK Korea & EPS-TOPIK Indonesia"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Hakgyo - LPK Korea & EPS-TOPIK Indonesia Terbaik",
    description: "LPK Korea murah dan terpercaya untuk persiapan EPS-TOPIK. Bergabung dengan 10.000+ siswa yang telah lulus!",
    images: ["/logo/hakgyo-dark.png"],
    creator: "@hakgyo",
    site: "@hakgyo",
  },
  verification: {
    google: "lGljTx7XheFt5-NyHsBqLD7l1VC9DDJqK2h6FzXjVsk",
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    // Add other verification codes as needed
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'ko-KR': '/ko-KR',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Hakgyo',
    alternateName: 'Hakgyo LPK Korea',
    description: 'Hakgyo adalah LPK Korea murah dan terpercaya untuk persiapan EPS-TOPIK Indonesia. Platform belajar bahasa Korea lengkap dengan materi EPS-TOPIK, live session, dan komunitas aktif.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://hakgyo.vercel.app',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://hakgyo.vercel.app'}/logo/hakgyo-dark.png`,
    sameAs: [
      'https://www.facebook.com/hakgyo',
      'https://www.instagram.com/hakgyo',
      'https://www.youtube.com/hakgyo',
      'https://twitter.com/hakgyo',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ID',
      addressLocality: 'Jakarta',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '+62-812-3456-7890',
      email: 'info@hakgyo.com',
      availableLanguage: ['Indonesian', 'English', 'Korean'],
    },
    areaServed: {
      '@type': 'Place',
      name: 'Indonesia',
    },
    educationalCredentialAwarded: 'EPS-TOPIK Certification',
    offers: {
      '@type': 'Offer',
      name: 'EPS-TOPIK Preparation Course',
      price: '299000',
      priceCurrency: 'IDR',
      description: 'Complete EPS-TOPIK preparation course with materials, live sessions, and practice tests',
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Indonesian Workers Seeking Employment in Korea',
    },
    keywords: 'hakgyo, EPS TOPIK Indonesia, LPK Korea, LPK murah, belajar bahasa Korea, kursus bahasa Korea',
  };

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_APP_URL || 'https://hakgyo.vercel.app'} />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={`${architectsDaughter.variable} ${geistMono.variable} antialiased`} // Use architectsDaughter for --font-sans
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
