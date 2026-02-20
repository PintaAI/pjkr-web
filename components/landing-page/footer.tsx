"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'Kelas EPS-TOPIK', href: '/kelas' },
    { name: 'Latihan Soal', href: '/soal/latihan' },
    { name: 'Tryout EPS-TOPIK', href: '/soal/tryout' },
    { name: 'Vocabulary', href: '/vocabulary' },
    { name: 'Live Session', href: '/live-session' },
  ],
  company: [
    { name: 'Tentang Hakgyo', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Karir', href: '/careers' },
    { name: 'Partner', href: '/partner' },
    { name: 'Kontak', href: '/contact' },
  ],
  support: [
    { name: 'Bantuan', href: '/help' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Syarat & Ketentuan', href: '/terms' },
    { name: 'Kebijakan Privasi', href: '/privacy' },
    { name: 'Refund Policy', href: '/refund' },
  ],
  resources: [
    { name: 'Panduan EPS-TOPIK', href: '/guide/eps-topik' },
    { name: 'Tips Belajar Bahasa Korea', href: '/guide/learn-korean' },
    { name: 'Info LPK Korea', href: '/guide/lpk-korea' },
    { name: 'Jadwal Ujian EPS-TOPIK', href: '/guide/exam-schedule' },
    { name: 'Download Materi', href: '/downloads' },
  ]
};

const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/hakgyo', icon: <Facebook className="w-5 h-5" /> },
  { name: 'Instagram', href: 'https://instagram.com/hakgyo', icon: <Instagram className="w-5 h-5" /> },
  { name: 'YouTube', href: 'https://youtube.com/hakgyo', icon: <Youtube className="w-5 h-5" /> },
  { name: 'Twitter', href: 'https://twitter.com/hakgyo', icon: <Twitter className="w-5 h-5" /> },
];

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/40">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 hover:opacity-80 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                <Image
                  priority={true}
                  src="/logo/hakgyo-light.png"
                  alt="Hakgyo Logo - Platform Belajar Bahasa Korea dan EPS-TOPIK"
                  width={40}
                  height={40}
                  className="dark:hidden p-1"
                />
                <Image
                  priority={true}
                  src="/logo/hakgyo-dark.png"
                  alt="Hakgyo Logo - Platform Belajar Bahasa Korea dan EPS-TOPIK"
                  width={40}
                  height={40}
                  className="hidden dark:block p-1"
                />
              </div>
              <span className="font-bold text-xl">Hakgyo</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Platform belajar bahasa Korea dan persiapan EPS-TOPIK terbaik di Indonesia. 
              LPK Korea murah berkualitas tinggi.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4 text-base">Produk</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4 text-base">Perusahaan</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4 text-base">Dukungan</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-base">Sumber Daya</h3>
            <ul className="space-y-3 mb-6">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="space-y-3 pt-4 border-t border-border/40">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <a href="mailto:info@hakgyo.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  info@hakgyo.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <a href="tel:+6281234567890" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  +62 812-3456-7890
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  Jakarta, Indonesia
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Hakgyo. All Rights Reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <Link href="/sitemap.xml" className="hover:text-foreground transition-colors">
                Sitemap
              </Link>
              <Link href="/robots.txt" className="hover:text-foreground transition-colors">
                Robots.txt
              </Link>
              <span className="text-border">|</span>
              <span>Made with ❤️ in Indonesia</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
