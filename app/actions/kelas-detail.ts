"use server";

import { prisma } from "@/lib/db";

export async function getKelasDetail(id: string) {
  try {
    const kelasId = parseInt(id);
    
    if (isNaN(kelasId)) {
      return {
        success: false,
        error: "Invalid kelas ID",
        data: null,
      };
    }

    const kelas = await prisma.kelas.findFirst({
      where: {
        id: kelasId,
        isDraft: false, // Only show published classes
      },
      select: {
        id: true,
        title: true,
        description: true,
        jsonDescription: true,
        htmlDescription: true,
        type: true,
        level: true,
        thumbnail: true, // Add thumbnail field
        icon: true,
        isPaidClass: true,
        price: true,
        discount: true,
        promoCode: true,
        isDraft: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        materis: {
          where: {
            isDraft: false, // Only show published materis
          },
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
            isDemo: true,
            createdAt: true,
          },
        },
        liveSessions: {
          where: {
            status: {
              in: ["SCHEDULED", "LIVE"],
            },
          },
          orderBy: {
            scheduledStart: "asc",
          },
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            scheduledStart: true,
            scheduledEnd: true,
          },
        },
        vocabularySets: {
          where: {
            isPublic: true,
          },
          select: {
            id: true,
            title: true,
            description: true,
            icon: true,
            _count: {
              select: {
                items: true,
              },
            },
          },
        },
        posts: {
          where: {
            isPublished: true,
          },
          orderBy: [
            { isPinned: "desc" },
            { createdAt: "desc" },
          ],
          take: 5,
          select: {
            id: true,
            title: true,
            type: true,
            isPinned: true,
            likeCount: true,
            commentCount: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            materis: true,
            members: true,
            liveSessions: true,
            vocabularySets: true,
            posts: true,
          },
        },
      },
    });

    if (!kelas) {
      return {
        success: false,
        error: "Class not found",
        data: null,
      };
    }

    return {
      success: true,
      data: kelas,
    };
  } catch (error) {
    console.error("Get kelas detail error:", error);
    return {
      success: false,
      error: "Failed to fetch class details",
      data: null,
    };
  }
}

export async function checkKelasAccess(kelasId: string, userId?: string) {
  try {
    const kelasIdNum = parseInt(kelasId);
    
    if (isNaN(kelasIdNum)) {
      return {
        success: false,
        hasAccess: false,
        error: "Invalid kelas ID",
      };
    }

    const kelas = await prisma.kelas.findFirst({
      where: {
        id: kelasIdNum,
        isDraft: false,
      },
      include: {
        members: userId ? {
          where: {
            id: userId,
          },
        } : false,
      },
    });

    if (!kelas) {
      return {
        success: false,
        hasAccess: false,
        error: "Class not found",
      };
    }

    // If it's a free class, everyone has access
    if (!kelas.isPaidClass) {
      return {
        success: true,
        hasAccess: true,
        isPaid: false,
      };
    }

    // If it's a paid class and user is not logged in
    if (!userId) {
      return {
        success: true,
        hasAccess: false,
        isPaid: true,
        price: kelas.price,
      };
    }

    // Check if user is a member or the author
    const isMember = kelas.members && kelas.members.length > 0;
    const isAuthor = kelas.authorId === userId;

    return {
      success: true,
      hasAccess: isMember || isAuthor,
      isPaid: true,
      price: kelas.price,
      isMember,
      isAuthor,
    };
  } catch (error) {
    console.error("Check kelas access error:", error);
    return {
      success: false,
      hasAccess: false,
      error: "Failed to check access",
    };
  }
}
