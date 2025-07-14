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
import { BookOpen, Clock, Users, Star, Play, CheckCircle, Lock } from "lucide-react";
import Link from "next/link";

interface KelasDetailData {
  id: number;
  title: string;
  description: string | null;
  level: string;
  thumbnail: string | null;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  materis: Array<{
    id: number;
    title: string;
    order: number;
    isDemo: boolean;
  }>;
  members: Array<{
    id: string;
    name: string | null;
    image: string | null;
  }>;
  _count: {
    materis: number;
    members: number;
    completions: number;
  };
}

interface KelasDetailPageProps {
  params: Promise<{ kelasId: string }>;
}

async function getKelasDetail(id: string): Promise<KelasDetailData | null> {
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

export default async function KelasDetailPage(props: KelasDetailPageProps) {
  const params = await props.params;
  const { kelasId } = params;

  const kelasData = await getKelasDetail(kelasId);

  if (!kelasData) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">Class Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested class could not be found.</p>
            <Button asChild>
              <Link href="/kelas">Back to Classes</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const calculateProgress = (): number => {
    // Mock progress calculation - in real app, this would come from user completion data
    return Math.floor(Math.random() * 100);
  };

  const progress = calculateProgress();
  const completedMateris = Math.floor(kelasData.materis.length * (progress / 100));

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl flex flex-col gap-6">
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
            <BreadcrumbPage>{kelasData.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Class Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="text-sm">
              {kelasData.level}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              {kelasData._count.members} students
            </div>
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight mb-4">{kelasData.title}</h1>
          <p className="text-muted-foreground text-lg mb-6">{kelasData.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              {kelasData._count.materis} lessons
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1" />
              {kelasData.author.name || 'Instructor'}
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="lg:w-80">
          <CardHeader>
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Completed</span>
                <span>{completedMateris}/{kelasData._count.materis} lessons</span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
            </div>
            
            <Button className="w-full" size="lg">
              <Play className="h-4 w-4 mr-2" />
              Continue Learning
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Course Content */}
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
          <CardDescription>
            {kelasData._count.materis} lessons in this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {kelasData.materis
              .sort((a, b) => a.order - b.order)
              .map((materi, index) => {
                const isCompleted = index < completedMateris;
                const isCurrent = index === completedMateris;
                const isLocked = index > completedMateris && !materi.isDemo;
                
                return (
                  <div
                    key={materi.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      isCurrent 
                        ? 'bg-primary/5 border-primary/20' 
                        : isCompleted 
                        ? 'bg-green-50 border-green-200' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 ${
                        isCompleted 
                          ? 'text-green-600' 
                          : isCurrent 
                          ? 'text-primary' 
                          : isLocked 
                          ? 'text-muted-foreground' 
                          : 'text-muted-foreground'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : isLocked ? (
                          <Lock className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </div>
                      
                      <div>
                        <h3 className={`font-medium ${
                          isLocked ? 'text-muted-foreground' : ''
                        }`}>
                          {materi.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Lesson {materi.order}</span>
                          {materi.isDemo && (
                            <Badge variant="outline" className="text-xs">Demo</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant={isCurrent ? "default" : isCompleted ? "outline" : "ghost"}
                      size="sm"
                      disabled={isLocked}
                      asChild={!isLocked}
                    >
                      {isLocked ? (
                        <span>Locked</span>
                      ) : (
                        <Link href={`/kelas/${kelasId}/materi/${materi.id}`}>
                          {isCompleted ? "Review" : isCurrent ? "Continue" : "Start"}
                        </Link>
                      )}
                    </Button>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
