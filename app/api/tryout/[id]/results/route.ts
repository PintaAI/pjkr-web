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

        // Check if user is the Guru (creator) of the tryout
        const tryout = await prisma.tryout.findUnique({
            where: { id: tryoutId },
        });

        if (!tryout) {
            return NextResponse.json({ success: false, error: 'Tryout not found' }, { status: 404 });
        }

        let results;

        if (tryout.guruId === session.user.id) {
            // Guru sees all results
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
                },
                orderBy: { score: 'desc' },
            });
        } else {
            // Student sees only their result
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
                            koleksiSoal: {
                                select: {
                                    _count: {
                                        select: { soals: true }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            // Wrap in array for consistency or return object?
            // Mobile expects something. Let's return object for single, array for list?
            // The mobile service `getTryoutResults` returns `any`.
            // Let's stick to standard: "data" holds the result.
            // If student, usually they want details about their performance.
            // If this endpoint is generic, let's return the single object for student.
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
