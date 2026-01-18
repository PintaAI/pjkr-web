import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function PATCH(
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

        // Verify ownership
        const soal = await prisma.soal.findUnique({
            where: { id: soalId },
            include: { koleksiSoal: true },
        });

        if (!soal) {
            return NextResponse.json({ success: false, error: 'Soal not found' }, { status: 404 });
        }

        if (soal.authorId !== session.user.id && soal.koleksiSoal.userId !== session.user.id) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        // Toggle active status
        const updatedSoal = await prisma.soal.update({
            where: { id: soalId },
            data: {
                isActive: !soal.isActive,
            },
        });

        return NextResponse.json({
            success: true,
            data: updatedSoal,
        });
    } catch (error) {
        console.error('Error toggling soal active status:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to toggle status' },
            { status: 500 }
        );
    }
}
