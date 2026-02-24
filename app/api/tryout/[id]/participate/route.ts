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
        if (isNaN(tryoutId)) {
            return NextResponse.json({ success: false, error: 'Invalid tryout id' }, { status: 400 });
        }

        // Fetch tryout to validate
        const tryout = await prisma.tryout.findUnique({
            where: { id: tryoutId },
        });

        if (!tryout) {
            return NextResponse.json({ success: false, error: 'Tryout not found' }, { status: 404 });
        }

        // Check if tryout is active
        if (!tryout.isActive) {
            return NextResponse.json({ success: false, error: 'Tryout is not active' }, { status: 400 });
        }

        // Check if tryout is within time window
        const now = new Date();
        if (now < tryout.startTime) {
            return NextResponse.json({ success: false, error: 'Tryout has not started yet' }, { status: 400 });
        }

        if (now > tryout.endTime) {
            return NextResponse.json({ success: false, error: 'Tryout has ended' }, { status: 400 });
        }

        // Check if user already participated
        const existing = await prisma.tryoutParticipant.findUnique({
            where: {
                tryoutId_userId: {
                    tryoutId,
                    userId: session.user.id,
                }
            }
        });

        if (existing) {
            // Check if user can retry (if maxAttempts > 1 and not exceeded)
            if (existing.status === 'SUBMITTED' && existing.attemptCount < tryout.maxAttempts) {
                // Allow retry - update attempt count and reset status
                const updatedParticipant = await prisma.tryoutParticipant.update({
                    where: { id: existing.id },
                    data: {
                        status: 'IN_PROGRESS',
                        startedAt: new Date(),
                        attemptCount: existing.attemptCount + 1,
                        score: 0,
                        submittedAt: null,
                        timeTakenSeconds: null,
                    },
                });
                // Delete old answers for retry
                await prisma.tryoutAnswer.deleteMany({
                    where: { participantId: existing.id },
                });
                return NextResponse.json({ success: true, data: updatedParticipant });
            }

            // Return existing if no retry allowed
            return NextResponse.json({ success: true, data: existing });
        }

        const participant = await prisma.tryoutParticipant.create({
            data: {
                tryoutId,
                userId: session.user.id,
                status: 'IN_PROGRESS',
                startedAt: new Date(),
                attemptCount: 1,
            },
        });

        return NextResponse.json({
            success: true,
            data: participant,
        });
    } catch (error) {
        console.error('Error participating in tryout:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to join tryout' },
            { status: 500 }
        );
    }
}
