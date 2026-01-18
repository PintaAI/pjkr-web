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

        const tryoutId = parseInt(id);

        // Verify ownership
        const tryout = await prisma.tryout.findUnique({
            where: { id: tryoutId },
        });

        if (!tryout) {
            return NextResponse.json({ success: false, error: 'Tryout not found' }, { status: 404 });
        }

        if (tryout.guruId !== session.user.id) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        // Toggle active status
        const updatedTryout = await prisma.tryout.update({
            where: { id: tryoutId },
            data: {
                isActive: !tryout.isActive,
            },
        });

        return NextResponse.json({
            success: true,
            data: updatedTryout,
        });
    } catch (error) {
        console.error('Error toggling tryout active status:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to toggle status' },
            { status: 500 }
        );
    }
}
