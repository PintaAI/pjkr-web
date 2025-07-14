import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, ArrowLeft, ArrowRight, CheckCircle, Play, FileText, Video, Download } from "lucide-react";
import Link from "next/link";

interface MateriDetailData {
  id: number;
  title: string;
  content: string | null;
  order: number;
  isDemo: boolean;
  kelas: {
    id: number;
    title: string;
    level: string;
  };
}

interface MateriDetailPageProps {
  params: Promise<{ kelasId: string; materiId: string }>;
}

async function getMateriDetail(id: string): Promise<MateriDetailData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/materi/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch materi detail');
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    
    return null;
  } catch (err) {
    console.error('Error fetching materi detail:', err);
    return null;
  }
}

async function getKelasDetail(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/kelas/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch kelas detail');
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    
    return null;
  } catch (err) {
    console.error('Error fetching kelas detail:', err);
    return null;
  }
}

export default async function MateriDetailPage(props: MateriDetailPageProps) {
  const params = await props.params;
  const { kelasId, materiId } = params;

  const [materiData, kelasData] = await Promise.all([
    getMateriDetail(materiId),
    getKelasDetail(kelasId)
  ]);

  if (!materiData || !kelasData) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">Lesson Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested lesson could not be found.</p>
            <Button asChild>
              <Link href={`/kelas/${kelasId}`}>Back to Class</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Get current materi index and navigation
  const currentIndex = kelasData.materis.findIndex((m: any) => m.id === parseInt(materiId));
  const previousMateri = currentIndex > 0 ? kelasData.materis[currentIndex - 1] : null;
  const nextMateri = currentIndex < kelasData.materis.length - 1 ? kelasData.materis[currentIndex + 1] : null;

  // Mock progress for this lesson
  const lessonProgress = Math.floor(Math.random() * 100);
  const isCompleted = lessonProgress === 100;

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/kelas">Kelas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/kelas/${kelasId}`}>{kelasData.title}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{materiData.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Lesson Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href={`/kelas/${kelasId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Class
          </Link>
        </Button>
        
        <div className="flex items-center gap-2">
          <Badge variant={materiData.isDemo ? "secondary" : "default"}>
            {materiData.isDemo ? "Demo" : "Premium"}
          </Badge>
          <Badge variant="outline">
            Lesson {materiData.order}
          </Badge>
        </div>
      </div>

      {/* Lesson Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{materiData.title}</CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {kelasData.title}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  ~15 min read
                </span>
              </CardDescription>
            </div>
            
            {isCompleted && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex flex-col gap-6">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Lesson Progress</span>
              <span>{lessonProgress}%</span>
            </div>
            <Progress value={lessonProgress} className="h-2" />
          </div>

          {/* Lesson Content */}
          <div className="prose prose-gray max-w-none">
            <div className="bg-muted/30 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Video className="h-5 w-5 mr-2 text-primary" />
                Video Lesson
              </h3>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Video content would be embedded here</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Lesson Content
              </h3>
              
              {materiData.content ? (
                <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {materiData.content}
                </div>
              ) : (
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Welcome to <strong>{materiData.title}</strong>! This lesson is part of the <strong>{kelasData.title}</strong> course.
                  </p>
                  <p>
                    In this lesson, you'll learn fundamental concepts that will help you progress in your Korean language learning journey. 
                    The content is carefully structured to build upon previous lessons while introducing new vocabulary and grammar patterns.
                  </p>
                  <p>
                    Take your time to absorb the material, and don't hesitate to review previous lessons if needed. 
                    Practice makes perfect, and consistent study will help you achieve fluency.
                  </p>
                </div>
              )}
            </div>

            {/* Downloads Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Downloads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Lesson Notes (PDF)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Practice Exercises
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {previousMateri ? (
          <Button variant="outline" asChild>
            <Link href={`/kelas/${kelasId}/materi/${previousMateri.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous: {previousMateri.title}
            </Link>
          </Button>
        ) : (
          <div></div>
        )}

        <Button
          className={isCompleted ? "bg-green-600 hover:bg-green-700" : ""}
          disabled={isCompleted}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed
            </>
          ) : (
            "Mark as Complete"
          )}
        </Button>

        {nextMateri ? (
          <Button asChild>
            <Link href={`/kelas/${kelasId}/materi/${nextMateri.id}`}>
              Next: {nextMateri.title}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href={`/kelas/${kelasId}`}>
              Back to Class
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
