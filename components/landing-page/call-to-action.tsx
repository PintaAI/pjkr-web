"use client";
import React from 'react';
import { Button } from "../ui/button";
import Link from 'next/link';
import { CheckCircle2, Clock, Users, TrendingUp, Zap, Shield } from 'lucide-react';

const benefits = [
  {
    icon: <CheckCircle2 className="w-5 h-5" />,
    text: "Akses ke 500+ materi belajar EPS-TOPIK"
  },
  {
    icon: <Clock className="w-5 h-5" />,
    text: "Belajar kapan saja, 24/7 akses penuh"
  },
  {
    icon: <Users className="w-5 h-5" />,
    text: "Komunitas 10.000+ siswa aktif"
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    text: "95% tingkat kelulusan EPS-TOPIK"
  },
  {
    icon: <Zap className="w-5 h-5" />,
    text: "Live session mingguan dengan pengajar profesional"
  },
  {
    icon: <Shield className="w-5 h-5" />,
    text: "Jaminan kepuasan atau uang kembali"
  }
];

export const CallToAction = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/90 to-primary/80 text-primary-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTM2IDM0djBoLTJ2LTJoMnptMC0zaDJ2MmgtMnYtMmgyem0wLTZ2MmgtMnYtMmgyem0tMiA4djJoLTJ2LTJoMnptLTItMnYyaC0ydi0yaDJ6bTAtNnYyaC0ydi0yaDJ6bS0yIDh2MmgtMnYtMmgyem0tMi0ydjJoLTJ2LTJoMnptMC02djJoLTJ2LTJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Mulai Gratis Hari Ini</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Siap Lulus EPS-TOPIK dan Wujudkan Impian ke Korea?
            </h2>

            <p className="text-lg md:text-xl mb-8 leading-relaxed text-primary-foreground/90">
              Bergabunglah dengan Hakgyo sekarang dan dapatkan akses ke materi belajar lengkap, 
              live session, dan komunitas suportif. LPK Korea murah dengan kualitas terbaik.
            </p>

            <div className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                    {benefit.icon}
                  </div>
                  <span className="text-base">{benefit.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="px-8 py-4 text-base font-semibold w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
                >
                  Daftar Gratis Sekarang
                </Button>
              </Link>
              <Link href="/kelas">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 py-4 text-base font-semibold w-full sm:w-auto border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground"
                >
                  Lihat Paket Belajar
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-primary-foreground/70">
              Tidak perlu kartu kredit. Batalkan kapan saja.
            </p>
          </div>

          {/* Right Content - Pricing Card */}
          <div className="relative">
            <div className="bg-background text-foreground rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-semibold mb-4">
                  Paket Populer
                </div>
                <h3 className="text-2xl font-bold mb-2">Paket EPS-TOPIK Lengkap</h3>
                <p className="text-muted-foreground">Semua yang Anda butuhkan untuk lulus</p>
              </div>

              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold">Rp 299.000</span>
                  <span className="text-muted-foreground">/bulan</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Hemat 50% dari harga normal Rp 599.000
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  "Akses 500+ materi EPS-TOPIK",
                  "Live session mingguan",
                  "Simulasi ujian realistis",
                  "Komunitas diskusi",
                  "Sertifikat kompetensi",
                  "Support 24/7"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <Link href="/auth/signup">
                <Button size="lg" className="w-full">
                  Pilih Paket Ini
                </Button>
              </Link>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Jaminan kepuasan 30 hari uang kembali
              </p>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-foreground/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
