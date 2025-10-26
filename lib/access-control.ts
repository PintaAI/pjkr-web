import { prisma } from '@/lib/db'

/**
 * Check if user can access a kelas (class)
 * User can access if they are:
 * 1. The author of the kelas
 * 2. A member of the kelas
 * 3. An admin (optional, can be added later)
 */
export async function canAccessKelas(userId: string, kelasId: number): Promise<boolean> {
  try {
    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      select: {
        id: true,
        authorId: true,
        members: {
          where: { id: userId },
          select: { id: true }
        }
      }
    })
    
    if (!kelas) return false
    
    // Allow access if user is author or member
    return kelas.authorId === userId || kelas.members.length > 0
  } catch (error) {
    console.error('Error checking kelas access:', error)
    return false
  }
}

/**
 * Check if user can modify a kelas (class)
 * User can modify if they are:
 * 1. The author of the kelas
 * 2. An admin (optional, can be added later)
 */
export async function canModifyKelas(userId: string, kelasId: number): Promise<boolean> {
  try {
    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      select: { id: true, authorId: true }
    })
    
    if (!kelas) return false
    
    return kelas.authorId === userId
  } catch (error) {
    console.error('Error checking kelas modification access:', error)
    return false
  }
}

/**
 * Check if user can access materi (material)
 * User can access if they are:
 * 1. The author of the kelas that contains the materi
 * 2. A member of the kelas that contains the materi
 * 3. The materi is marked as demo (for limited access)
 */
export async function canAccessMateri(userId: string, materiId: number): Promise<boolean> {
  try {
    const materi = await prisma.materi.findUnique({
      where: { id: materiId },
      select: {
        id: true,
        isDemo: true,
        kelas: {
          select: {
            id: true,
            authorId: true,
            members: {
              where: { id: userId },
              select: { id: true }
            }
          }
        }
      }
    })
    
    if (!materi) return false
    
    // Allow access if user is author or member of the kelas
    const isAuthor = materi.kelas.authorId === userId
    const isMember = materi.kelas.members.length > 0
    
    return isAuthor || isMember
  } catch (error) {
    console.error('Error checking materi access:', error)
    return false
  }
}

/**
 * Check if user can modify materi (material)
 * User can modify if they are:
 * 1. The author of the kelas that contains the materi
 * 2. An admin (optional, can be added later)
 */
export async function canModifyMateri(userId: string, materiId: number): Promise<boolean> {
  try {
    const materi = await prisma.materi.findUnique({
      where: { id: materiId },
      select: {
        id: true,
        kelas: {
          select: {
            id: true,
            authorId: true
          }
        }
      }
    })
    
    if (!materi) return false
    
    return materi.kelas.authorId === userId
  } catch (error) {
    console.error('Error checking materi modification access:', error)
    return false
  }
}

/**
 * Check if user can access vocabulary set
 * User can access if they are:
 * 1. The owner of the vocabulary set
 * 2. The vocabulary set is public
 * 3. A member of the kelas associated with the vocabulary set
 * 4. The author of the kelas associated with the vocabulary set
 */
export async function canAccessVocabularySet(userId: string, vocabularySetId: number): Promise<boolean> {
  try {
    const vocabularySet = await prisma.vocabularySet.findUnique({
      where: { id: vocabularySetId },
      select: {
        id: true,
        isPublic: true,
        userId: true,
        kelas: {
          select: {
            id: true,
            authorId: true,
            members: {
              where: { id: userId },
              select: { id: true }
            }
          }
        }
      }
    })
    
    if (!vocabularySet) return false
    
    // Allow access if:
    // 1. It's public
    // 2. User owns it
    // 3. User is member of associated kelas
    // 4. User is author of associated kelas
    return vocabularySet.isPublic ||
           vocabularySet.userId === userId ||
           (vocabularySet.kelas?.members && vocabularySet.kelas.members.length > 0) ||
           vocabularySet.kelas?.authorId === userId
  } catch (error) {
    console.error('Error checking vocabulary set access:', error)
    return false
  }
}

/**
 * Check if user can modify vocabulary set
 * User can modify if they are:
 * 1. The owner of the vocabulary set
 * 2. The author of the kelas associated with the vocabulary set
 * 3. An admin (optional, can be added later)
 */
export async function canModifyVocabularySet(userId: string, vocabularySetId: number): Promise<boolean> {
  try {
    const vocabularySet = await prisma.vocabularySet.findUnique({
      where: { id: vocabularySetId },
      select: {
        id: true,
        userId: true,
        kelas: {
          select: {
            id: true,
            authorId: true
          }
        }
      }
    })
    
    if (!vocabularySet) return false
    
    return vocabularySet.userId === userId || 
           vocabularySet.kelas?.authorId === userId
  } catch (error) {
    console.error('Error checking vocabulary set modification access:', error)
    return false
  }
}

/**
 * Filter demo content for non-enrolled users
 * Returns limited information for demo materi when user is not enrolled
 */
export function filterDemoContent(materi: any, isEnrolled: boolean) {
  if (materi.isDemo && !isEnrolled) {
    // Return only demo-safe content
    return {
      id: materi.id,
      title: materi.title,
      description: materi.description,
      order: materi.order,
      isDemo: true,
      kelas: materi.kelas,
      createdAt: materi.createdAt,
      updatedAt: materi.updatedAt
      // Exclude full content (jsonDescription, htmlDescription, koleksiSoal, etc.)
    }
  }
  return materi
}