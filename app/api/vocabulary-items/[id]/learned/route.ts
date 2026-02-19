import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { GamificationService } from '@/lib/gamification/service'

// PUT /api/vocabulary-items/[id]/learned - Mark/unmark vocabulary item as learned
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const itemId = parseInt(params.id)
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vocabulary item ID' },
        { status: 400 }
      )
    }

    // Get current user session
    const session = await auth.api.getSession({
      headers: await request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { isLearned } = body

    if (typeof isLearned !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isLearned must be a boolean' },
        { status: 400 }
      )
    }

    // Check if vocabulary item exists
    const existingItem = await prisma.vocabularyItem.findUnique({
      where: { id: itemId }
    })

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'Vocabulary item not found' },
        { status: 404 }
      )
    }

    // Upsert progress record
    const progress = await prisma.vocabularyItemProgress.upsert({
      where: {
        itemId_userId: {
          itemId,
          userId: session.user.id
        }
      },
      update: {
        isLearned,
        learnedAt: isLearned ? new Date() : null
      },
      create: {
        itemId,
        userId: session.user.id,
        isLearned,
        learnedAt: isLearned ? new Date() : null
      },
      include: {
        item: {
          select: {
            id: true,
            korean: true,
            indonesian: true,
            type: true,
            pos: true,
            audioUrl: true,
            exampleSentences: true,
            order: true,
            createdAt: true,
            updatedAt: true,
            creatorId: true,
            collectionId: true
          }
        }
      }
    })

    // Trigger gamification if marking as learned
    if (isLearned) {
      try {
        console.log(`[GAMIFICATION] Triggering COMPLETE_VOCABULARY event for user ${session.user.id}, item ${itemId}`);
        const gamificationResult = await GamificationService.triggerEvent(
          session.user.id,
          'COMPLETE_VOCABULARY',
          { itemId, collectionId: existingItem.collectionId }
        );
        console.log('[GAMIFICATION] COMPLETE_VOCABULARY event triggered successfully:', {
          userId: session.user.id,
          itemId,
          result: gamificationResult
        });
      } catch (gamificationError) {
        // Log gamification error but don't fail the main operation
        console.error('[GAMIFICATION] Error triggering COMPLETE_VOCABULARY event:', gamificationError);
      }
    }

    return NextResponse.json({
      success: true,
      data: progress
    })
  } catch (error) {
    console.error('Error updating vocabulary item learned status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update vocabulary item learned status' },
      { status: 500 }
    )
  }
}
