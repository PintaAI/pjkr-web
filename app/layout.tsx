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
    default: "Hakgyo - Learn Korean Language and Culture",
    template: "%s | Hakgyo"
  },
  description: "Hakgyo is your comprehensive platform for learning Korean language and culture. Interactive lessons, vocabulary practice, live sessions, and engaging content to master Korean.",
  keywords: [
    "Korean language",
    "Learn Korean",
    "Korean culture",
    "Language learning",
    "Korean lessons",
    "TOPIK",
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
    "LPK terbaik",
    "belajar bahasa online",
    "aplikasi belajar bahasa korea",
    "belajar bahasa korea online",
    "kursus bahasa korea",
    "les bahasa korea",
    "belajar korea gratis",
    "aplikasi belajar korea",
    "platform belajar bahasa korea"
  ],
  authors: [{ name: "Hakgyo" }],
  creator: "Hakgyo",
  publisher: "Hakgyo",
  applicationName: "Hakgyo",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://hakgyo.com'),
  category: 'education',
  classification: 'Education, Language Learning',
  referrer: 'origin-when-cross-origin',
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Hakgyo",
    title: "Hakgyo - Learn Korean Language and Culture",
    description: "Comprehensive platform for learning Korean language and culture with interactive lessons and live sessions.",
    images: [
      {
        url: "/logo/hakgyo-dark.png",
        width: 1200,
        height: 630,
        alt: "Hakgyo Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Hakgyo - Learn Korean Language and Culture",
    description: "Comprehensive platform for learning Korean language and culture with interactive lessons and live sessions.",
    images: ["/logo/hakgyo-dark.png"],
    creator: "@hakgyo",
    site: "@hakgyo",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
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
    description: 'Comprehensive platform for learning Korean language and culture with interactive lessons and live sessions.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://hakgyo.com',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://hakgyo.com'}/logo/hakgyo-dark.png`,
    sameAs: [
      // Add social media links when available
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['English', 'Korean'],
    },
    areaServed: {
      '@type': 'Place',
      name: 'Worldwide',
    },
    educationalCredentialAwarded: 'Korean Language Proficiency',
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_APP_URL || 'https://hakgyo.com'} />
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
