import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/kelas/route'
import { GET as GET_BY_ID, PUT, DELETE } from '@/app/api/kelas/[id]/route'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    kelas: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}))

const { prisma } = require('@/lib/db')

// Mock data
const mockKelas = {
  id: 1,
  title: 'Test Kelas',
  description: 'Test Description',
  type: 'REGULAR',
  level: 'BEGINNER',
  authorId: 'user123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  author: {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    image: null
  },
  materis: [],
  members: [],
  vocabularySets: [],
  _count: {
    materis: 0,
    members: 0,
    completions: 0
  }
}

describe('/api/kelas', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/kelas', () => {
    it('should return all kelas successfully', async () => {
      prisma.kelas.findMany.mockResolvedValue([mockKelas])

      const request = new NextRequest('http://localhost:3000/api/kelas')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([mockKelas])
      expect(prisma.kelas.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: undefined,
        skip: 0
      })
    })

    it('should filter kelas by type', async () => {
      prisma.kelas.findMany.mockResolvedValue([mockKelas])

      const request = new NextRequest('http://localhost:3000/api/kelas?type=REGULAR')
      const response = await GET(request)

      expect(prisma.kelas.findMany).toHaveBeenCalledWith({
        where: { type: 'REGULAR' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: undefined,
        skip: 0
      })
    })

    it('should handle pagination', async () => {
      prisma.kelas.findMany.mockResolvedValue([mockKelas])

      const request = new NextRequest('http://localhost:3000/api/kelas?limit=10&offset=20')
      const response = await GET(request)

      expect(prisma.kelas.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 20
      })
    })

    it('should filter kelas by authorEmail', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.kelas.findMany.mockResolvedValue([mockKelas])

      const request = new NextRequest('http://localhost:3000/api/kelas?authorEmail=test@example.com')
      const response = await GET(request)

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: { id: true }
      })
      expect(prisma.kelas.findMany).toHaveBeenCalledWith({
        where: { authorId: 'user123' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: undefined,
        skip: 0
      })
    })

    it('should return empty result when authorEmail does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/kelas?authorEmail=nonexistent@example.com')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([])
      expect(data.meta.total).toBe(0)
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
        select: { id: true }
      })
      expect(prisma.kelas.findMany).not.toHaveBeenCalled()
    })

    it('should prioritize authorId over authorEmail when both are provided', async () => {
      prisma.kelas.findMany.mockResolvedValue([mockKelas])

      const request = new NextRequest('http://localhost:3000/api/kelas?authorId=user456&authorEmail=test@example.com')
      const response = await GET(request)

      expect(prisma.user.findUnique).not.toHaveBeenCalled()
      expect(prisma.kelas.findMany).toHaveBeenCalledWith({
        where: { authorId: 'user456' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: undefined,
        skip: 0
      })
    })
  })

  describe('POST /api/kelas', () => {
    it('should create a new kelas successfully', async () => {
      prisma.kelas.create.mockResolvedValue(mockKelas)

      const requestBody = {
        title: 'Test Kelas',
        description: 'Test Description',
        level: 'BEGINNER',
        authorId: 'user123'
      }

      const request = new NextRequest('http://localhost:3000/api/kelas', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockKelas)
      expect(prisma.kelas.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Test Kelas',
          description: 'Test Description',
          level: 'BEGINNER',
          authorId: 'user123',
          type: 'REGULAR'
        }),
        include: expect.any(Object)
      })
    })

    it('should return 400 for missing required fields', async () => {
      const requestBody = {
        title: 'Test Kelas'
        // Missing level and authorId
      }

      const request = new NextRequest('http://localhost:3000/api/kelas', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('required')
    })
  })
})

describe('/api/kelas/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/kelas/[id]', () => {
    it('should return specific kelas successfully', async () => {
      prisma.kelas.findUnique.mockResolvedValue(mockKelas)

      const request = new NextRequest('http://localhost:3000/api/kelas/1')
      const params = Promise.resolve({ id: '1' })
      const response = await GET_BY_ID(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockKelas)
      expect(prisma.kelas.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object)
      })
    })

    it('should return 404 for non-existent kelas', async () => {
      prisma.kelas.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/kelas/999')
      const params = Promise.resolve({ id: '999' })
      const response = await GET_BY_ID(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Class not found')
    })

    it('should return 400 for invalid ID format', async () => {
      const request = new NextRequest('http://localhost:3000/api/kelas/invalid')
      const params = Promise.resolve({ id: 'invalid' })
      const response = await GET_BY_ID(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid class ID')
    })
  })

  describe('PUT /api/kelas/[id]', () => {
    it('should update kelas successfully', async () => {
      prisma.kelas.findUnique.mockResolvedValue(mockKelas)
      prisma.kelas.update.mockResolvedValue({ ...mockKelas, title: 'Updated Title' })

      const requestBody = { title: 'Updated Title' }
      const request = new NextRequest('http://localhost:3000/api/kelas/1', {
        method: 'PUT',
        body: JSON.stringify(requestBody)
      })

      const params = Promise.resolve({ id: '1' })
      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.title).toBe('Updated Title')
      expect(prisma.kelas.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { title: 'Updated Title' },
        include: expect.any(Object)
      })
    })

    it('should return 404 for non-existent kelas', async () => {
      prisma.kelas.findUnique.mockResolvedValue(null)

      const requestBody = { title: 'Updated Title' }
      const request = new NextRequest('http://localhost:3000/api/kelas/999', {
        method: 'PUT',
        body: JSON.stringify(requestBody)
      })

      const params = Promise.resolve({ id: '999' })
      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Class not found')
    })
  })

  describe('DELETE /api/kelas/[id]', () => {
    it('should delete kelas successfully', async () => {
      prisma.kelas.findUnique.mockResolvedValue(mockKelas)
      prisma.kelas.delete.mockResolvedValue(mockKelas)

      const request = new NextRequest('http://localhost:3000/api/kelas/1', {
        method: 'DELETE'
      })

      const params = Promise.resolve({ id: '1' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Class deleted successfully')
      expect(prisma.kelas.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      })
    })

    it('should return 404 for non-existent kelas', async () => {
      prisma.kelas.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/kelas/999', {
        method: 'DELETE'
      })

      const params = Promise.resolve({ id: '999' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Class not found')
    })
  })
})
