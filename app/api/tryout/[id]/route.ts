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
            isActive,
        } = body;

        const updatedTryout = await prisma.tryout.update({
            where: { id: tryoutId },
            data: {
                nama,
                description,
                startTime: startTime ? new Date(startTime) : undefined,
                endTime: endTime ? new Date(endTime) : undefined,
                duration: duration ? parseInt(duration) : undefined,
                maxAttempts: maxAttempts ? parseInt(maxAttempts) : undefined,
                shuffleQuestions,
                passingScore: passingScore ? parseInt(passingScore) : undefined,
                isActive,
            },
        });

        return NextResponse.json({
            success: true,
            data: updatedTryout,
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
