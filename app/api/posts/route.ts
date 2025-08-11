import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!kelasId) {
      return NextResponse.json({ error: 'Kelas ID is required' }, { status: 400 });
    }

    const posts = await prisma.post.findMany({
      where: {
        kelasId: parseInt(kelasId),
        isPublished: true,
      },
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
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    });

    const totalPosts = await prisma.post.count({
      where: {
        kelasId: parseInt(kelasId),
        isPublished: true,
      },
    });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total: totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, htmlDescription, jsonDescription, type = 'DISCUSSION', kelasId, isPinned = false } = body;

    if (!title || !htmlDescription || !kelasId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user is enrolled in the class or is the author
    const kelas = await prisma.kelas.findFirst({
      where: {
        id: parseInt(kelasId),
        OR: [
          { authorId: session.user.id },
          { members: { some: { id: session.user.id } } },
        ],
      },
    });

    if (!kelas) {
      return NextResponse.json({ error: 'Not authorized to post in this class' }, { status: 403 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        htmlDescription,
        jsonDescription: jsonDescription || {},
        type,
        kelasId: parseInt(kelasId),
        authorId: session.user.id,
        isPinned: isPinned && kelas.authorId === session.user.id, // Only class author can pin
      },
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
            comments: true,
            likes: true,
          },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}