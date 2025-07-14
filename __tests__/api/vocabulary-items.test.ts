import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/vocabulary-items/route'
import { GET as GET_BY_ID, PUT, DELETE } from '@/app/api/vocabulary-items/[id]/route'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    vocabularyItem: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    vocabularySet: {
      findUnique: jest.fn(),
    },
  },
}))

const { prisma } = require('@/lib/db')

// Mock data
const mockVocabularyItem = {
  id: 1,
  korean: '안녕하세요',
  indonesian: 'Halo',
  isLearned: false,
  type: 'WORD',
  pos: 'KATA_KERJA',
  audioUrl: null,
  exampleSentences: ['안녕하세요, 만나서 반갑습니다.'],
  creatorId: 'user123',
  collectionId: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  creator: {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    image: null
  },
  collection: {
    id: 1,
    title: 'Basic Greetings',
    description: 'Common Korean greetings',
    icon: 'FaBook',
    isPublic: true
  }
}

const mockUser = {
  id: 'user123',
  name: 'Test User',
  email: 'test@example.com'
}

const mockCollection = {
  id: 1,
  title: 'Basic Greetings',
  userId: 'user123'
}

describe('/api/vocabulary-items', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/vocabulary-items', () => {
    it('should return all vocabulary items successfully', async () => {
      prisma.vocabularyItem.findMany.mockResolvedValue([mockVocabularyItem])

      const request = new NextRequest('http://localhost:3000/api/vocabulary-items')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([mockVocabularyItem])
      expect(prisma.vocabularyItem.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: undefined,
        skip: 0
      })
    })

    it('should filter vocabulary items by creator', async () => {
      prisma.vocabularyItem.findMany.mockResolvedValue([mockVocabularyItem])

      const request = new NextRequest('http://localhost:3000/api/vocabulary-items?creatorId=user123')
      const response = await GET(request)

      expect(prisma.vocabularyItem.findMany).toHaveBeenCalledWith({
        where: { creatorId: 'user123' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: undefined,
        skip: 0
      })
    })

    it('should filter vocabulary items by collection', async () => {
      prisma.vocabularyItem.findMany.mockResolvedValue([mockVocabularyItem])

      const request = new NextRequest('http://localhost:3000/api/vocabulary-items?collectionId=1')
      const response = await GET(request)

      expect(prisma.vocabularyItem.findMany).toHaveBeenCalledWith({
        where: { collectionId: 1 },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: undefined,
        skip: 0
      })
    })

    it('should search vocabulary items by text', async () => {
      prisma.vocabularyItem.findMany.mockResolvedValue([mockVocabularyItem])

      const request = new NextRequest('http://localhost:3000/api/vocabulary-items?search=안녕')
      const response = await GET(request)

      expect(prisma.vocabularyItem.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { korean: { contains: '안녕', mode: 'insensitive' } },
            { indonesian: { contains: '안녕', mode: 'insensitive' } }
          ]
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: undefined,
        skip: 0
      })
    })

    it('should filter by type and part of speech', async () => {
      prisma.vocabularyItem.findMany.mockResolvedValue([mockVocabularyItem])

      const request = new NextRequest('http://localhost:3000/api/vocabulary-items?type=WORD&pos=KATA_KERJA')
      const response = await GET(request)

      expect(prisma.vocabularyItem.findMany).toHaveBeenCalledWith({
        where: { type: 'WORD', pos: 'KATA_KERJA' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: undefined,
        skip: 0
      })
    })
  })

  describe('POST /api/vocabulary-items', () => {
    it('should create a new vocabulary item successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.vocabularySet.findUnique.mockResolvedValue(mockCollection)
      prisma.vocabularyItem.create.mockResolvedValue(mockVocabularyItem)

      const requestBody = {
        korean: '안녕하세요',
        indonesian: 'Halo',
        type: 'WORD',
        pos: 'KATA_KERJA',
        creatorId: 'user123',
        collectionId: 1
      }

      const request = new NextRequest('http://localhost:3000/api/vocabulary-items', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockVocabularyItem)
      expect(prisma.vocabularyItem.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          korean: '안녕하세요',
          indonesian: 'Halo',
          type: 'WORD',
          pos: 'KATA_KERJA',
          creatorId: 'user123',
          collectionId: 1
        }),
        include: expect.any(Object)
      })
    })

    it('should return 400 for missing required fields', async () => {
      const requestBody = {
        korean: '안녕하세요'
        // Missing indonesian and creatorId
      }

      const request = new NextRequest('http://localhost:3000/api/vocabulary-items', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('required')
    })

    it('should return 404 for non-existent creator', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      const requestBody = {
        korean: '안녕하세요',
        indonesian: 'Halo',
        creatorId: 'nonexistent'
      }

      const request = new NextRequest('http://localhost:3000/api/vocabulary-items', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Creator not found')
    })

    it('should return 404 for non-existent collection', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.vocabularySet.findUnique.mockResolvedValue(null)

      const requestBody = {
        korean: '안녕하세요',
        indonesian: 'Halo',
        creatorId: 'user123',
        collectionId: 999
      }

      const request = new NextRequest('http://localhost:3000/api/vocabulary-items', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Collection not found')
    })
  })
})

describe('/api/vocabulary-items/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/vocabulary-items/[id]', () => {
    it('should return specific vocabulary item successfully', async () => {
      prisma.vocabularyItem.findUnique.mockResolvedValue(mockVocabularyItem)

      const request = new NextRequest('http://localhost:3000/api/vocabulary-items/1')
      const params = Promise.resolve({ id: '1' })
      const response = await GET_BY_ID(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockVocabularyItem)
      expect(prisma.vocabularyItem.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object)
      })
    })

    it('should return 404 for non-existent vocabulary item', async () => {
      prisma.vocabularyItem.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/vocabulary-items/999')
      const params = Promise.resolve({ id: '999' })
      const response = await GET_BY_ID(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Vocabulary item not found')
    })
  })

  describe('PUT /api/vocabulary-items/[id]', () => {
    it('should update vocabulary item successfully', async () => {
      prisma.vocabularyItem.findUnique.mockResolvedValue(mockVocabularyItem)
      prisma.vocabularyItem.update.mockResolvedValue({ 
        ...mockVocabularyItem, 
        indonesian: 'Selamat pagi' 
      })

      const requestBody = { indonesian: 'Selamat pagi' }
      const request = new NextRequest('http://localhost:3000/api/vocabulary-items/1', {
        method: 'PUT',
        body: JSON.stringify(requestBody)
      })

      const params = Promise.resolve({ id: '1' })
      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.indonesian).toBe('Selamat pagi')
      expect(prisma.vocabularyItem.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { indonesian: 'Selamat pagi' },
        include: expect.any(Object)
      })
    })

    it('should mark item as learned', async () => {
      prisma.vocabularyItem.findUnique.mockResolvedValue(mockVocabularyItem)
      prisma.vocabularyItem.update.mockResolvedValue({ 
        ...mockVocabularyItem, 
        isLearned: true 
      })

      const requestBody = { isLearned: true }
      const request = new NextRequest('http://localhost:3000/api/vocabulary-items/1', {
        method: 'PUT',
        body: JSON.stringify(requestBody)
      })

      const params = Promise.resolve({ id: '1' })
      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.isLearned).toBe(true)
    })
  })

  describe('DELETE /api/vocabulary-items/[id]', () => {
    it('should delete vocabulary item successfully', async () => {
      prisma.vocabularyItem.findUnique.mockResolvedValue(mockVocabularyItem)
      prisma.vocabularyItem.delete.mockResolvedValue(mockVocabularyItem)

      const request = new NextRequest('http://localhost:3000/api/vocabulary-items/1', {
        method: 'DELETE'
      })

      const params = Promise.resolve({ id: '1' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Vocabulary item deleted successfully')
      expect(prisma.vocabularyItem.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      })
    })
  })
})
