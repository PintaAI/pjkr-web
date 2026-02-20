"use client";
import React from 'react';
import { Card, CardContent, CardTitle, CardDescription } from "../ui/card";
import { BookOpen, PlayCircle, Users, Award, Clock, Target, Globe, HeadphonesIcon, GraduationCap, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from "../ui/button";

const features = [
  {
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    title: "Materi EPS-TOPIK Lengkap",
    description: "Akses ribuan soal latihan EPS-TOPIK dari level dasar hingga lanjut. Materi disusun berdasarkan standar ujian resmi.",
    link: "/soal/tryout",
    badge: "Terpopuler"
  },
  {
    icon: <PlayCircle className="w-8 h-8 text-primary" />,
    title: "Live Session Interaktif",
    description: "Belajar langsung dengan pengajar bersertifikat melalui live session. Tanya jawab langsung dan diskusi materi.",
    link: "/live-session",
    badge: "Live"
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: "Komunitas Belajar Aktif",
    description: "Bergabung dengan ribuan siswa lainnya. Diskusi, berbagi tips, dan motivasi bersama menuju kelulusan.",
    link: "/kelas",
    badge: "Komunitas"
  },
  {
    icon: <Award className="w-8 h-8 text-primary" />,
    title: "Sertifikat Kompetensi",
    description: "Dapatkan sertifikat resmi setelah menyelesaikan setiap level. Bukti kompetensi bahasa Korea Anda.",
    link: "/dashboard",
    badge: "Premium"
  },
  {
    icon: <Clock className="w-8 h-8 text-primary" />,
    title: "Belajar Fleksibel 24/7",
    description: "Akses materi kapan saja dan di mana saja. Cocok untuk pekerja dan pelajar dengan jadwal padat.",
    link: "/vocabulary",
    badge: "Fleksibel"
  },
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: "Simulasi Ujian Realistis",
    description: "Latihan dengan format ujian yang sama dengan EPS-TOPIK asli. Siap mental dan teknis saat hari H.",
    link: "/soal/tryout",
    badge: "Simulasi"
  }
];

const whyChooseUs = [
  {
    icon: <Globe className="w-12 h-12 text-primary" />,
    title: "LPK Korea Terpercaya",
    description: "Hakgyo adalah LPK Korea yang telah dipercaya oleh ribuan siswa di Indonesia untuk persiapan EPS-TOPIK dan belajar bahasa Korea."
  },
  {
    icon: <HeadphonesIcon className="w-12 h-12 text-primary" />,
    title: "Dukungan Penuh",
    description: "Tim support kami siap membantu Anda kapan saja. Dari pendaftaran hingga kelulusan, kami menemani perjalanan Anda."
  },
  {
    icon: <GraduationCap className="w-12 h-12 text-primary" />,
    title: "Pengajar Profesional",
    description: "Belajar dari pengajar yang berpengalaman dan tersertifikasi. Mereka memahami tantangan belajar bahasa Korea."
  },
  {
    icon: <TrendingUp className="w-12 h-12 text-primary" />,
    title: "Tingkat Kelulusan Tinggi",
    description: "95% siswa Hakgyo berhasil lulus EPS-TOPIK. Metode pembelajaran kami terbukti efektif dan efisien."
  }
];

export const Features = () => {
  return (
    <>
      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Fitur Lengkap untuk Persiapan EPS-TOPIK
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
              Hakgyo menyediakan semua yang Anda butuhkan untuk lulus EPS-TOPIK dan menguasai bahasa Korea. 
              Dari materi lengkap hingga komunitas suportif.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-left p-6 h-full flex flex-col hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30 relative overflow-hidden group">
                {feature.badge && (
                  <div className="absolute top-4 right-4 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                    {feature.badge}
                  </div>
                )}
                <div className="mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl inline-block group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="mb-3 text-xl font-semibold">{feature.title}</CardTitle>
                <CardContent className="p-0 flex-grow mb-4">
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
                {feature.link && (
                  <Link href={feature.link}>
                    <Button variant="ghost" className="w-full group/btn">
                      Pelajari Lebih Lanjut
                      <span className="ml-2 group-hover/btn:translate-x-1 transition-transform">→</span>
                    </Button>
                  </Link>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="about" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Mengapa Memilih Hakgyo?
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
              Hakgyo adalah LPK Korea murah berkualitas tinggi yang fokus pada kesuksesan siswa dalam ujian EPS-TOPIK 
              dan penguasaan bahasa Korea.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="flex gap-6 p-6 bg-background rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="flex-shrink-0">
                  <div className="p-4 bg-primary/10 rounded-2xl">
                    {item.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
