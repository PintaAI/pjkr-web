import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const kelasId = parseInt(resolvedParams.id);
    if (isNaN(kelasId)) {
      return NextResponse.json({ error: 'Invalid kelas ID' }, { status: 400 });
    }

    // Check if user is member of kelas
    const kelasMembership = await prisma.kelas.findFirst({
      where: {
        id: kelasId,
        members: {
          some: {
            id: session.user.id
          }
        }
      }
    });

    if (!kelasMembership) {
      return NextResponse.json({ error: 'Not a member of this kelas' }, { status: 403 });
    }

    // Get all materis in kelas with user progress
    const materis = await prisma.materi.findMany({
      where: {
        kelasId: kelasId,
        isDraft: false
      },
      include: {
        completions: {
          where: {
            userId: session.user.id
          }
        },
        assessments: {
          where: {
            userId: session.user.id
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Process materis to determine access and completion status
    const processedMateris = [];
    let completedCount = 0;
    const totalCount = materis.length;

    for (let i = 0; i < materis.length; i++) {
      const materi = materis[i];
      const completion = materi.completions[0];
      const assessment = materi.assessments[0];
      
      // Determine if materi is accessible
      let isAccessible = false;
      
      if (i === 0) {
        // First materi is always accessible
        isAccessible = true;
      } else {
        // Check if previous materi is completed
        const previousMateri = materis[i - 1];
        const previousCompletion = previousMateri?.completions[0];
        
        if (previousCompletion?.isCompleted) {
          // If previous materi has assessment, check if user passed it
          if (previousMateri.passingScore && !previousCompletion.assessmentPassed) {
            isAccessible = false;
          } else {
            isAccessible = true;
          }
        }
      }
      
      // Determine if materi is fully completed
      let isFullyCompleted = false;
      if (completion?.isCompleted) {
        if (materi.passingScore) {
          // Assessment required - need both content AND assessment passed
          isFullyCompleted = completion.assessmentPassed || false;
        } else {
          // No assessment required - content completion is enough
          isFullyCompleted = true;
        }
        
        if (isFullyCompleted) {
          completedCount++;
        }
      }
      
      processedMateris.push({
        id: materi.id,
        title: materi.title,
        order: materi.order,
        isAccessible,
        isCompleted: completion?.isCompleted || false,
        isFullyCompleted,
        hasAssessment: !!materi.passingScore,
        assessmentPassed: completion?.assessmentPassed || false,
        score: assessment?.score || null,
        canRetake: !!materi.passingScore
      });
    }

    const overallProgress = {
      completedCount,
      totalCount,
      completionPercentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        materis: processedMateris,
        overallProgress
      }
    });
  } catch (error) {
    console.error('Error getting kelas progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}