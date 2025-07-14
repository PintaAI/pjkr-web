import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { VocabularyType, PartOfSpeech } from '@prisma/client'

// GET /api/vocabulary-items - Get all vocabulary items
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const creatorId = searchParams.get('creatorId')
    const collectionId = searchParams.get('collectionId')
    const type = searchParams.get('type') as VocabularyType | null
    const pos = searchParams.get('pos') as PartOfSpeech | null
    const isLearned = searchParams.get('isLearned')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    const where: any = {}
    if (creatorId) where.creatorId = creatorId
    if (collectionId) where.collectionId = parseInt(collectionId)
    if (type) where.type = type
    if (pos) where.pos = pos
    if (isLearned !== null) where.isLearned = isLearned === 'true'
    
    // Search in Korean or Indonesian text
    if (search) {
      where.OR = [
        { korean: { contains: search, mode: 'insensitive' } },
        { indonesian: { contains: search, mode: 'insensitive' } }
      ]
    }

    const vocabularyItems = await prisma.vocabularyItem.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        collection: {
          select: {
            id: true,
            title: true,
            description: true,
            icon: true,
            isPublic: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    return NextResponse.json({
      success: true,
      data: vocabularyItems,
      meta: {
        total: vocabularyItems.length,
        offset,
        limit
      }
    })
  } catch (error) {
    console.error('Error fetching vocabulary items:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vocabulary items' },
      { status: 500 }
    )
  }
}

// POST /api/vocabulary-items - Create new vocabulary item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      korean,
      indonesian,
      isLearned = false,
      type = 'WORD',
      pos,
      audioUrl,
      exampleSentences = [],
      creatorId,
      collectionId
    } = body

    // Validate required fields
    if (!korean || !indonesian || !creatorId) {
      return NextResponse.json(
        { success: false, error: 'Korean, Indonesian, and creatorId are required' },
        { status: 400 }
      )
    }

    // Check if creator exists
    const creator = await prisma.user.findUnique({
      where: { id: creatorId }
    })

    if (!creator) {
      return NextResponse.json(
        { success: false, error: 'Creator not found' },
        { status: 404 }
      )
    }

    // Check if collection exists (if provided)
    if (collectionId) {
      const collection = await prisma.vocabularySet.findUnique({
        where: { id: parseInt(collectionId) }
      })

      if (!collection) {
        return NextResponse.json(
          { success: false, error: 'Collection not found' },
          { status: 404 }
        )
      }
    }

    const vocabularyItem = await prisma.vocabularyItem.create({
      data: {
        korean,
        indonesian,
        isLearned,
        type: type as VocabularyType,
        pos: pos as PartOfSpeech,
        audioUrl,
        exampleSentences,
        creatorId,
        collectionId: collectionId ? parseInt(collectionId) : null
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        collection: {
          select: {
            id: true,
            title: true,
            description: true,
            icon: true,
            isPublic: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: vocabularyItem
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating vocabulary item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create vocabulary item' },
      { status: 500 }
    )
  }
}
