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

        // Check if duplicate participation
        const existing = await prisma.tryoutParticipant.findUnique({
            where: {
                tryoutId_userId: {
                    tryoutId,
                    userId: session.user.id,
                }
            }
        });

        if (existing) {
            return NextResponse.json({ success: true, data: existing });
        }

        const participant = await prisma.tryoutParticipant.create({
            data: {
                tryoutId,
                userId: session.user.id,
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
