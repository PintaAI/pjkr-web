import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/push-tokens - Get all active push tokens for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const pushTokens = await prisma.expoPushToken.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: pushTokens,
    });
  } catch (error) {
    console.error('Error fetching push tokens:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch push tokens' },
      { status: 500 }
    );
  }
}
