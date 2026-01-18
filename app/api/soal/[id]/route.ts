import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// Helper to check ownership
async function checkOwnership(soalId: number, userId: string) {
    const soal = await prisma.soal.findUnique({
        where: { id: soalId },
        include: { koleksiSoal: true },
    });
    if (!soal) return null;
    // Check if user owns the collection (and thus the soal)
    if (soal.authorId !== userId && soal.koleksiSoal.userId !== userId) {
        return false;
    }
    return soal;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth.api.getSession({ headers: request.headers });
        // Optional: check if user has access to this soal (private?)
        // For now, allow reading if authenticated or public logic (skipped for brevity, strict CRUD)

        const soal = await prisma.soal.findUnique({
            where: { id: parseInt(id) },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                opsis: {
                    orderBy: {
                        order: 'asc',
                    },
                    include: {
                        attachments: true,
                    }
                },
                attachments: true,
            },
        });

        if (!soal) {
            return NextResponse.json({ success: false, error: 'Soal not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: soal,
        });
    } catch (error) {
        console.error('Error fetching soal:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch soal' },
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

        const soalId = parseInt(id);
        const existingSoal = await checkOwnership(soalId, session.user.id);

        if (existingSoal === null) {
            return NextResponse.json({ success: false, error: 'Soal not found' }, { status: 404 });
        }
        if (existingSoal === false) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const {
            pertanyaan,
            difficulty,
            explanation,
            isActive,
            order,
            opsi,
            opsis: opsisAlias, // handle update??
        } = body;

        const opsis = opsi || opsisAlias;

        // Transactional update
        const updatedSoal = await prisma.$transaction(async (tx) => {
            // 1. Update basic fields
            const updated = await tx.soal.update({
                where: { id: soalId },
                data: {
                    pertanyaan,
                    difficulty,
                    explanation,
                    isActive,
                    order,
                },
            });

            // 2. Handle Opsis if provided
            // A simple strategy: if opsis provided, we might need to upsert or delete/create.
            // For now, implementing a "Smart Sync" is complex. 
            // If the mobile app sends the full list, we can:
            // - Delete existing opsis not in the new list (by ID)
            // - Update existing opsis present in the new list
            // - Create new opsis without ID
            if (opsis && Array.isArray(opsis)) {
                // This logic depends on what the mobile app sends. 
                // Assuming it sends objects with optional `id`.

                // Get current opsis
                const currentOpsis = await tx.opsi.findMany({ where: { soalId } });
                const currentIds = currentOpsis.map(o => o.id);
                const incomingIds = opsis.filter((o: any) => o.id).map((o: any) => o.id);

                // Delete removed
                const toDelete = currentIds.filter(id => !incomingIds.includes(id));
                if (toDelete.length > 0) {
                    await tx.opsi.deleteMany({ where: { id: { in: toDelete } } });
                }

                // Update or Create
                for (const op of opsis) {
                    if (op.id) {
                        await tx.opsi.update({
                            where: { id: op.id },
                            data: {
                                opsiText: op.opsiText,
                                isCorrect: op.isCorrect,
                                order: op.order,
                            }
                        });
                    } else {
                        await tx.opsi.create({
                            data: {
                                soalId,
                                opsiText: op.opsiText,
                                isCorrect: op.isCorrect,
                                order: op.order,
                            }
                        });
                    }
                }
            }

            return updated;
        });

        return NextResponse.json({
            success: true,
            data: updatedSoal,
        });

    } catch (error) {
        console.error('Error updating soal:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update soal' },
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

        const soalId = parseInt(id);
        const existingSoal = await checkOwnership(soalId, session.user.id);

        if (existingSoal === null) {
            return NextResponse.json({ success: false, error: 'Soal not found' }, { status: 404 });
        }
        if (existingSoal === false) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        await prisma.soal.delete({
            where: { id: soalId },
        });

        return NextResponse.json({
            success: true,
            data: { id: soalId },
        });
    } catch (error) {
        console.error('Error deleting soal:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete soal' },
            { status: 500 }
        );
    }
}
