import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// DELETE /api/push-tokens/[id] - Delete a specific push token
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if the token exists and belongs to the user
    const token = await prisma.expoPushToken.findUnique({
      where: { id },
    });

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Push token not found' },
        { status: 404 }
      );
    }

    // Only allow users to delete their own tokens
    if (token.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Delete the token
    await prisma.expoPushToken.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting push token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete push token' },
      { status: 500 }
    );
  }
}
