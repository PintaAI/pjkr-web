import type { Metadata } from "next";
import { Architects_Daughter, Geist_Mono } from "next/font/google"; // Replaced Geist with Architects_Daughter
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LayoutWrapper } from "@/components/layout-wrapper";

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
  title: "Pejuangkorea Academy",
  description: "Learn Korean language and culture with Pejuangkorea Academy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
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
      </body>
    </html>
  );
}
