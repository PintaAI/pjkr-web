import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/vocabulary-sets - Get all vocabulary sets
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const kelasId = searchParams.get('kelasId')
    const isPublic = searchParams.get('isPublic')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    const where: any = {}
    if (userId) where.userId = userId
    if (kelasId) where.kelasId = parseInt(kelasId)
    if (isPublic !== null) where.isPublic = isPublic === 'true'

    const vocabularySets = await prisma.vocabularySet.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        kelas: {
          select: {
            id: true,
            title: true,
            type: true,
            level: true
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    return NextResponse.json({
      success: true,
      data: vocabularySets,
      meta: {
        total: vocabularySets.length,
        offset,
        limit
      }
    })
  } catch (error) {
    console.error('Error fetching vocabulary sets:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vocabulary sets' },
      { status: 500 }
    )
  }
}

// POST /api/vocabulary-sets - Create new vocabulary set
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      icon = 'FaBook',
      isPublic = false,
      userId,
      kelasId
    } = body

    // Validate required fields
    if (!title || !userId) {
      return NextResponse.json(
        { success: false, error: 'Title and userId are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if kelas exists (if provided)
    if (kelasId) {
      const kelas = await prisma.kelas.findUnique({
        where: { id: parseInt(kelasId) }
      })

      if (!kelas) {
        return NextResponse.json(
          { success: false, error: 'Class not found' },
          { status: 404 }
        )
      }
    }

    const vocabularySet = await prisma.vocabularySet.create({
      data: {
        title,
        description,
        icon,
        isPublic,
        userId,
        kelasId: kelasId ? parseInt(kelasId) : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        kelas: {
          select: {
            id: true,
            title: true,
            type: true,
            level: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: vocabularySet
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating vocabulary set:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create vocabulary set' },
      { status: 500 }
    )
  }
}
