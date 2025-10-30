import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id || null

    const searchParams = request.nextUrl.searchParams
    const userIdParam = searchParams.get('userId')
    const kelasId = searchParams.get('kelasId')
    const isPrivate = searchParams.get('isPrivate')
    const isDraft = searchParams.get('isDraft')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    const where: any = {}

    if (userIdParam) where.userId = userIdParam
    if (kelasId) {
      where.kelasKoleksiSoals = {
        some: {
          kelasId: parseInt(kelasId)
        }
      }
    }
    if (isPrivate !== null) where.isPrivate = isPrivate === 'true'
    if (isDraft !== null) where.isDraft = isDraft === 'true'

    // If no userId specified and user is not logged in, only return public, non-draft collections
    if (!userIdParam && !userId) {
      where.isPrivate = false
      where.isDraft = false
    }
    // If no userId specified but user is logged in, return user's own collections (including drafts) or public non-draft ones
    else if (!userIdParam && userId) {
      where.OR = [
        {
          userId: userId,
          // User can see their own collections regardless of draft/private status
        },
        {
          isPrivate: false,
          isDraft: false
        }
      ]
    }

    const koleksiSoals = await prisma.koleksiSoal.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        soals: {
          select: {
            id: true,
            pertanyaan: true,
            difficulty: true,
            isActive: true,
            order: true,
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
            },
            attachments: true,
          },
          orderBy: { order: 'asc' },
        },
        kelasKoleksiSoals: {
          include: {
            kelas: {
              select: {
                id: true,
                title: true,
                level: true,
              },
            },
          },
        },
        _count: {
          select: {
            soals: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return NextResponse.json({
      success: true,
      data: koleksiSoals,
      meta: {
        total: koleksiSoals.length,
        offset,
        limit,
      },
    })
  } catch (error) {
    console.error('Error fetching soal collections:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch soal collections' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      nama,
      deskripsi,
      isPrivate = false,
      isDraft = true,
    } = body

    // Validate required fields
    if (!nama) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    const koleksiSoal = await prisma.koleksiSoal.create({
      data: {
        nama,
        deskripsi,
        isPrivate,
        isDraft,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        soals: {
          select: {
            id: true,
            pertanyaan: true,
            difficulty: true,
            isActive: true,
            order: true,
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
            },
            attachments: true,
          },
          orderBy: { order: 'asc' },
        },
        kelasKoleksiSoals: {
          include: {
            kelas: {
              select: {
                id: true,
                title: true,
                level: true,
              },
            },
          },
        },
        _count: {
          select: {
            soals: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: koleksiSoal,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating soal collection:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create soal collection' },
      { status: 500 }
    )
  }
}