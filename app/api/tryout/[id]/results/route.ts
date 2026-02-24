import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(
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

        // Check if user is the Guru (creator) of the tryout
        const tryout = await prisma.tryout.findUnique({
            where: { id: tryoutId },
        });

        if (!tryout) {
            return NextResponse.json({ success: false, error: 'Tryout not found' }, { status: 404 });
        }

        let results;

        if (tryout.guruId === session.user.id) {
            // Guru sees all results with summary
            results = await prisma.tryoutParticipant.findMany({
                where: { tryoutId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                    _count: {
                        select: { answers: true }
                    }
                },
                orderBy: { score: 'desc' },
            });
        } else {
            // Student sees only their result with detailed answers
            results = await prisma.tryoutParticipant.findUnique({
                where: {
                    tryoutId_userId: {
                        tryoutId,
                        userId: session.user.id,
                    }
                },
                include: {
                    tryout: {
                        select: {
                            nama: true,
                            passingScore: true,
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
                    },
                    answers: {
                        include: {
                            participant: false, // Avoid circular reference
                        }
                    }
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error('Error fetching tryout results:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch results' },
            { status: 500 }
        );
    }
}
