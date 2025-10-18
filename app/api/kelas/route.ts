import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { KelasType, Difficulty } from '@prisma/client'

// GET /api/kelas - Get all classes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') as KelasType | null
    const level = searchParams.get('level') as Difficulty | null
    const authorId = searchParams.get('authorId')
    const authorEmail = searchParams.get('authorEmail')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    const where: any = {}
    if (type) where.type = type
    if (level) where.level = level
    if (authorId) where.authorId = authorId
    
    // If authorEmail is provided, find the user first and use their ID
    if (authorEmail) {
      const user = await prisma.user.findUnique({
        where: { email: authorEmail },
        select: { id: true }
      })
      
      if (user) {
        where.authorId = user.id
      } else {
        // If user with that email doesn't exist, return empty result
        return NextResponse.json({
          success: true,
          data: [],
          meta: {
            total: 0,
            offset,
            limit
          }
        })
      }
    }

    const kelas = await prisma.kelas.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        materis: {
          select: {
            id: true,
            title: true,
            order: true,
            isDemo: true
          },
          orderBy: { order: 'asc' }
        },
        members: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            materis: true,
            members: true,
            completions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    return NextResponse.json({
      success: true,
      data: kelas,
      meta: {
        total: kelas.length,
        offset,
        limit
      }
    })
  } catch (error) {
    console.error('Error fetching kelas:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}

// POST /api/kelas - Create new class
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      jsonDescription,
      htmlDescription,
      type = 'REGULAR',
      level,
      thumbnail,
      icon,
      isPaidClass = false,
      price,
      discount,
      promoCode,
      authorId
    } = body

    // Validate required fields
    if (!title || !level || !authorId) {
      return NextResponse.json(
        { success: false, error: 'Title, level, and authorId are required' },
        { status: 400 }
      )
    }

    const kelas = await prisma.kelas.create({
      data: {
        title,
        description,
        jsonDescription,
        htmlDescription,
        type: type as KelasType,
        level: level as Difficulty,
        thumbnail,
        icon,
        isPaidClass,
        price: price ? parseFloat(price) : null,
        discount: discount ? parseFloat(discount) : null,
        promoCode,
        authorId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: kelas
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating kelas:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create class' },
      { status: 500 }
    )
  }
}
