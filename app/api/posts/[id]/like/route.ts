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
    const postId = parseInt(resolvedParams.id);
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    // Check if post exists and user has access
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        isPublished: true,
        kelas: {
          OR: [
            { authorId: session.user.id },
            { members: { some: { id: session.user.id } } },
          ],
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found or no access' }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existingLike) {
      // Unlike: remove the like
      await prisma.postLike.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId,
          },
        },
      });

      // Decrement like count
      await prisma.post.update({
        where: { id: postId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json({ liked: false, message: 'Post unliked' });
    } else {
      // Like: add the like
      await prisma.postLike.create({
        data: {
          userId: session.user.id,
          postId,
        },
      });

      // Increment like count
      await prisma.post.update({
        where: { id: postId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({ liked: true, message: 'Post liked' });
    }
  } catch (error) {
    console.error('Error toggling post like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}