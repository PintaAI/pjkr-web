import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        // Validate id parameter
        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            return NextResponse.json({ success: false, error: 'Invalid tryout id' }, { status: 400 });
        }
        
        // const session = await auth.api.getSession({ headers: request.headers });
        // Tryout details usually accessible if active or if owned by guru

        const tryout = await prisma.tryout.findUnique({
           
            where: { id: parsedId },
            include: {
                guru: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                kelas: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                koleksiSoal: {
                    include: {
                        soals: {
                            include: {
                                opsis: {
                                    orderBy: { order: 'asc' }
                                },
                                attachments: true,
                            },
                            orderBy: { order: 'asc' }
                        }
                    }
                },
            },
        });

        if (!tryout) {
            return NextResponse.json({ success: false, error: 'Tryout not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: tryout,
        });
    } catch (error) {
        console.error('Error fetching tryout:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch tryout' },
            { status: 500 }
        );
    }
}

export async function PUT(
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
        
        const existingTryout = await prisma.tryout.findUnique({ where: { id: tryoutId } });

        if (!existingTryout) {
            return NextResponse.json({ success: false, error: 'Tryout not found' }, { status: 404 });
        }

        if (existingTryout.guruId !== session.user.id) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const {
            nama,
            description,
            startTime,
            endTime,
            duration,
            maxAttempts,
            shuffleQuestions,
            passingScore,
            koleksiSoalId,
            kelasId,
            isActive,
        } = body;

        // If kelasId is provided, verify user is the author
        if (kelasId !== undefined && kelasId !== null) {
            const kelas = await prisma.kelas.findUnique({
                where: { id: parseInt(kelasId) }
            });

            if (!kelas) {
                return NextResponse.json({ success: false, error: 'Kelas not found' }, { status: 404 });
            }

            if (kelas.authorId !== session.user.id) {
                return NextResponse.json({
                    success: false,
                    error: 'You must be the author of this kelas to link it'
                }, { status: 403 });
            }
        }

        const tryout = await prisma.tryout.update({
            where: { id: tryoutId },
            data: {
                ...(nama !== undefined && { nama }),
                ...(description !== undefined && { description }),
                ...(startTime !== undefined && { startTime: new Date(startTime) }),
                ...(endTime !== undefined && { endTime: new Date(endTime) }),
                ...(duration !== undefined && { duration: parseInt(duration) }),
                ...(maxAttempts !== undefined && { maxAttempts: parseInt(maxAttempts) }),
                ...(shuffleQuestions !== undefined && { shuffleQuestions }),
                ...(passingScore !== undefined && { passingScore: parseInt(passingScore) }),
                ...(koleksiSoalId !== undefined && { koleksiSoalId: parseInt(koleksiSoalId) }),
                ...(kelasId !== undefined && { kelasId: kelasId ? parseInt(kelasId) : null }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json({
            success: true,
            data: tryout,
        });
    } catch (error) {
        console.error('Error updating tryout:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update tryout' },
            { status: 500 }
        );
    }
}

export async function DELETE(
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
        
        const tryout = await prisma.tryout.findUnique({ where: { id: tryoutId } });

        if (!tryout) {
            return NextResponse.json({ success: false, error: 'Tryout not found' }, { status: 404 });
        }

        if (tryout.guruId !== session.user.id) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        await prisma.tryout.delete({
            where: { id: tryoutId },
        });

        return NextResponse.json({
            success: true,
            data: { id: tryoutId },
        });
    } catch (error) {
        console.error('Error deleting tryout:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete tryout' },
            { status: 500 }
        );
    }
}
