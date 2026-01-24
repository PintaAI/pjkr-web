import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const commentId = parseInt(resolvedParams.id);
    if (isNaN(commentId)) {
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 });
    }

    // Check if comment exists and user has access
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        post: {
          isPublished: true,
          kelas: {
            OR: [
              { authorId: session.user.id },
              { members: { some: { id: session.user.id } } },
            ],
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found or no access' }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    });

    if (existingLike) {
      // Unlike: remove the like
      await prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId,
          },
        },
      });

      // Decrement like count
      await prisma.comment.update({
        where: { id: commentId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json({ liked: false, message: 'Comment unliked' });
    } else {
      // Like: add the like
      await prisma.commentLike.create({
        data: {
          userId: session.user.id,
          commentId,
        },
      });

      // Increment like count
      await prisma.comment.update({
        where: { id: commentId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({ liked: true, message: 'Comment liked' });
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
