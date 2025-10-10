"use client";

import { BookOpen, Clock } from "lucide-react";
import { Card, CardContent,} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { motion } from "framer-motion";
import { NovelReadonly } from "@/components/novel/novel-readonly";
import Image from "next/image";
import { Badge } from "../ui/badge";

interface Kelas {
  id: number;
  title: string;
  authorId: string;
  thumbnail: string | null;
}

interface Materi {
  id: number;
  title: string;
  description: string;
  jsonDescription: any;
  htmlDescription: string;
  order: number;
  isDemo: boolean;
  createdAt: Date;
  kelas: Kelas;
}

interface MateriDetailPageProps {
  materi: Materi;
}

export default function MateriDetailPage({ materi }: MateriDetailPageProps) {
  


  return (
    <div className="w-full max-w-5xl mx-auto px-6 -mt-6">
      {/* Kelas Thumbnail Header */}
      <motion.div
        className="relative h-48 rounded-xl overflow-hidden mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="absolute inset-0">
          {materi.kelas.thumbnail ? (
            <>
              <Image
                src={materi.kelas.thumbnail}
                alt={materi.kelas.title}
                width={800}
                height={192}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)) / 0.8, hsl(var(--secondary)) / 0.6)"
              }}
            >
              <BookOpen className="w-16 h-16 text-white/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </div>
          )}
        </div>

        {/* Breadcrumb */}
        <div className="absolute top-4 left-4 right-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/kelas"
                  className="text-white/80 hover:text-white hover:underline"
                >
                  Classes
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/kelas/${materi.kelas.id}`}
                  className="text-white/80 hover:text-white hover:underline"
                >
                  {materi.kelas.title ?? "Class"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">{materi.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold">{materi.title}</h2>
            {materi.isDemo && (
              <Badge
                variant="outline"
                className="text-xs border-white/50 text-white"
              >
                Demo
              </Badge>
            )}
          </div>
          <p className="text-white/90 text-sm mb-2">{materi.description}</p>
          <div className="flex items-center gap-3 text-xs text-white/80">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Created {new Date(materi.createdAt).toLocaleDateString()}</span>
            </div>
            <span className="h-1 w-1 rounded-full bg-white/40" />
            <div>From: {materi.kelas.title}</div>
          </div>
        </div>
      </motion.div>


      {/* Content */}
      <Card className="border-none bg-primary/3 p-0 backdrop-blur-[2px]">
        <CardContent className="p-0 ">
          {materi.jsonDescription ? (
            <NovelReadonly content={materi.jsonDescription} />
          ) : materi.htmlDescription ? (
            <NovelReadonly html={materi.htmlDescription} />
          ) : (
            <div className="text-muted-foreground">
              <p>No content available for this material.</p>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
}