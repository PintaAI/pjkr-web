import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Only allow viewing own results unless admin/guru?
        // Let's allow if requesting own data
        if (session.user.id !== userId) {
            // Optionally allow if Admin, but for now strict
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const results = await prisma.tryoutParticipant.findMany({
            where: { userId },
            include: {
                tryout: {
                    select: {
                        id: true,
                        nama: true,
                        startTime: true,
                        endTime: true,
                        koleksiSoal: {
                            select: {
                                nama: true,
                            }
                        }
                    }
                }
            },
            orderBy: { submittedAt: 'desc' },
        });

        return NextResponse.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error('Error fetching user tryout results:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user results' },
            { status: 500 }
        );
    }
}
