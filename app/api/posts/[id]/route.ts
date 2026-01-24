import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/posts/[id] - Get specific post
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const postId = parseInt(params.id);
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        kelas: {
          select: {
            id: true,
            title: true,
            authorId: true,
          },
        },
        comments: {
          where: {
            parentId: null, // Only top-level comments
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
                _count: {
                  select: {
                    likes: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
            _count: {
              select: {
                likes: true,
                replies: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - Update specific post
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = parseInt(params.id);
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, htmlDescription, jsonDescription, type, isPinned } = body;

    // Check if post exists and user has permission to edit
    const existingPost = await prisma.post.findFirst({
      where: {
        id: postId,
        OR: [
          { authorId: session.user.id }, // Post author can edit
          { 
            kelas: { 
              authorId: session.user.id // Class author can edit any post
            }
          },
        ],
      },
      include: {
        kelas: true,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found or no permission to edit' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (htmlDescription !== undefined) updateData.htmlDescription = htmlDescription;
    if (jsonDescription !== undefined) updateData.jsonDescription = jsonDescription;
    if (type !== undefined) updateData.type = type;
    
    // Only class author can pin/unpin posts
    if (isPinned !== undefined && existingPost.kelas?.authorId === session.user.id) {
      updateData.isPinned = isPinned;
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete specific post
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = parseInt(params.id);
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    // Check if post exists and user has permission to delete
    const existingPost = await prisma.post.findFirst({
      where: {
        id: postId,
        OR: [
          { authorId: session.user.id }, // Post author can delete
          { 
            kelas: { 
              authorId: session.user.id // Class author can delete any post
            }
          },
        ],
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found or no permission to delete' },
        { status: 404 }
      );
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
