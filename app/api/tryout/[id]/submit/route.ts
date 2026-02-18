import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { GamificationService } from '@/lib/gamification/service';

// Simple in-memory lock for preventing race conditions
const processingLocks = new Map<string, { timestamp: number }>();
const LOCK_TIMEOUT = 30000; // 30 seconds timeout

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Check for existing lock to prevent race conditions
        const existingLock = processingLocks.get(session.user.id);
        const now = Date.now();
        
        if (existingLock && (now - existingLock.timestamp) < LOCK_TIMEOUT) {
            return NextResponse.json(
                { error: 'Request already in progress' },
                { status: 429 }
            );
        }

        // Set lock
        processingLocks.set(session.user.id, { timestamp: now });

        const tryoutId = parseInt(id);
        const body = await request.json();
        const { answers } = body; // Array of { soalId, opsiId }

        if (!Array.isArray(answers)) {
            return NextResponse.json({ success: false, error: 'Invalid answers format' }, { status: 400 });
        }

        // 1. Fetch Tryout Questions and Correct Answers
        // We need to fetch all questions for this tryout's collection
        const tryout = await prisma.tryout.findUnique({
            where: { id: tryoutId },
            select: {
                id: true,
                nama: true,
                koleksiSoal: {
                    include: {
                        soals: {
                            include: {
                                opsis: true,
                            }
                        }
                    }
                }
            }
        });

        if (!tryout) {
            return NextResponse.json({ success: false, error: 'Tryout not found' }, { status: 404 });
        }

        // 2. Calculate Score
        let correctCount = 0;
        const totalQuestions = tryout.koleksiSoal.soals.length;

        // Create a map for fast lookup of correct option per question
        const correctOptionsMap = new Map<number, number>(); // soalId -> correctOpsiId

        tryout.koleksiSoal.soals.forEach(soal => {
            const correctOpsi = soal.opsis.find(o => o.isCorrect);
            if (correctOpsi) {
                correctOptionsMap.set(soal.id, correctOpsi.id);
            }
        });

        // Tally score
        answers.forEach((ans: any) => {
            const correctId = correctOptionsMap.get(ans.soalId);
            if (correctId && ans.opsiId === correctId) {
                correctCount++;
            }
        });

        const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
        const isPerfectScore = score === 100;

        // 3. Update Participant Record
        const participant = await prisma.tryoutParticipant.update({
            where: {
                tryoutId_userId: {
                    tryoutId,
                    userId: session.user.id,
                }
            },
            data: {
                score,
                submittedAt: new Date(),
                // timeTakenSeconds... if we want to track it, need client to send it
            },
        });

        // Trigger gamification events
        const gamificationResults: any = {};

        // Trigger COMPLETE_SOAL event for completing the quiz
        const quizResult = await GamificationService.triggerEvent(
            session.user.id,
            'COMPLETE_SOAL',
            {
                tryoutId: tryout.id,
                tryoutTitle: tryout.nama,
                score,
                correctCount,
                totalQuestions
            }
        );

        if (quizResult.success) {
            gamificationResults.quiz = quizResult.data;
        }

        // Trigger PERFECT_SCORE event if user got 100%
        if (isPerfectScore) {
            const perfectScoreResult = await GamificationService.triggerEvent(
                session.user.id,
                'PERFECT_SCORE',
                {
                    tryoutId: tryout.id,
                    tryoutTitle: tryout.nama,
                    score: 100,
                    totalQuestions
                }
            );

            if (perfectScoreResult.success) {
                gamificationResults.perfectScore = perfectScoreResult.data;
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                score,
                correctCount,
                totalQuestions,
                participant,
                gamification: Object.keys(gamificationResults).length > 0 ? gamificationResults : undefined,
            },
        });

    } catch (error) {
        console.error('Error submitting tryout:', error);
        // If update fails (record not found), user might not have participated yet?
        // Should we auto-create? Better to error out or handle gracefully.
        return NextResponse.json(
            { success: false, error: 'Failed to submit tryout' },
            { status: 500 }
        );
    } finally {
        // Always release the lock if session exists
        const session = await auth.api.getSession({ headers: request.headers });
        if (session?.user?.id) {
            processingLocks.delete(session.user.id);
        }
    }
}
