import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

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
            include: {
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

        return NextResponse.json({
            success: true,
            data: {
                score,
                correctCount,
                totalQuestions,
                participant,
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
    }
}
