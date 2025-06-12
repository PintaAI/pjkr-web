"use client";
import React from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardTitle } from "./ui/card";
import { BookOpen, Users, PlayCircle, LogIn } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ModeToggle } from './mode-toggle';

const features = [
  {
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    title: "Materi Komprehensif",
    description: "Akses berbagai materi pembelajaran dari tingkat dasar hingga mahir."
  },
  {
    icon: <PlayCircle className="w-8 h-8 text-primary" />,
    title: "Pembelajaran Interaktif",
    description: "Pelajaran gamifikasi dan latihan interaktif yang menyenangkan."
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: "Sesi Live",
    description: "Bergabung dengan sesi live bersama guru bersertifikat."
  }
];

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-6xl">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image src="/small-logo.png" alt="Logo" width={36} height={36} className="rounded-lg" />
          <span className="font-semibold text-lg hidden sm:block">Pejuangkorea</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden md:inline-flex">
            Tentang
          </Button>
          <Button variant="ghost" size="sm" className="hidden md:inline-flex">
            Fitur
          </Button>
          <ModeToggle />
          <Button variant="outline" size="sm" asChild className="shadow-sm">
            <Link href="/auth" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <div className="mb-8 flex justify-center">
            <Image src="/logo.png" alt="Belajar Bahasa Korea" width={200} height={50} priority />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Belajar Bahasa Korea Jadi Mudah!
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Platform lengkap untuk belajar Bahasa Korea dari dasar hingga mahir.
          </p>
          <div className="flex justify-center">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-base">
              Mulai Belajar Sekarang
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Kenapa Memilih Kami?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Metode pembelajaran yang efektif dan menyenangkan
            </p>
          </div>
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-8 h-full flex flex-col">
                <div className="flex justify-center mb-6">
                  <div className="p-3 bg-primary/10 rounded-full">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="mb-4 text-xl">{feature.title}</CardTitle>
                <CardContent className="p-0 flex-grow">
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Siap Memulai?</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
            Bergabunglah dengan ribuan pelajar lainnya dan mulai perjalanan belajar Bahasa Korea Anda.
          </p>
          <div className="flex justify-center">
            <Button size="lg" className="px-10 py-4 text-base">
              Daftar Gratis Sekarang
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-6 text-center text-muted-foreground max-w-6xl">
          <p className="text-sm">&copy; {new Date().getFullYear()} BelajarBahasaKorea. Semua Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
