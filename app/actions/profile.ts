"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/session";

export async function getUserProfile() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
        data: null,
      };
    }

    const userId = session.user.id;

    // Fetch comprehensive user profile data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        currentStreak: true,
        xp: true,
        level: true,
        // Joined classes
        joinedKelas: {
          where: { isDraft: false },
          select: {
            id: true,
            title: true,
            description: true,
            level: true,
            thumbnail: true,
            icon: true,
            type: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                materis: true,
                members: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        // Vocabulary items created by user
        vocabularyItems: {
          select: {
            id: true,
            korean: true,
            indonesian: true,
            type: true,
            pos: true,
            isLearned: true,
            createdAt: true,
            collection: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        // Soal (questions) created by user
        soals: {
          select: {
            id: true,
            pertanyaan: true,
            difficulty: true,
            explanation: true,
            isActive: true,
            createdAt: true,
            koleksiSoal: {
              select: {
                id: true,
                nama: true,
                deskripsi: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        // Posts authored by user
        authoredPosts: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            createdAt: true,
            _count: {
              select: {
                likes: true,
                comments: true,
                shares: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        // Activity logs for stats
        activityLogs: {
          select: {
            id: true,
            type: true,
            xpEarned: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50, // Last 50 activities
        },
        // Completion stats
        _count: {
          select: {
            joinedKelas: true,
            vocabularyItems: true,
            soals: true,
            materiCompletions: true,
            kelasCompletions: true,
            authoredKelas: true,
            authoredPosts: true,
            comments: true,
            postLikes: true,
            tryoutParticipations: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        data: null,
      };
    }

    // Type assertion to access the selected relations
    const userWithRelations = user as any;

    // Calculate additional stats
    const totalActivities = userWithRelations.activityLogs.length;
    const totalXPEarned = userWithRelations.activityLogs.reduce((sum: number, log: any) => sum + (log.xpEarned || 0), 0);

    // Get recent activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivities = userWithRelations.activityLogs.filter((log: any) =>
      new Date(log.createdAt) >= sevenDaysAgo
    );

    // Serialize data for client
    const serializedUser = {
      ...userWithRelations,
      createdAt: userWithRelations.createdAt.toISOString(),
      updatedAt: userWithRelations.updatedAt.toISOString(),
      joinedKelas: userWithRelations.joinedKelas.map((kelas: any) => ({
        ...kelas,
        price: kelas.price ? Number(kelas.price) : null,
        createdAt: kelas.createdAt.toISOString(),
      })),
      authoredKelas: userWithRelations.authoredKelas.map((kelas: any) => ({
        ...kelas,
        price: kelas.price ? Number(kelas.price) : null,
        createdAt: kelas.createdAt.toISOString(),
      })),
      vocabularyItems: userWithRelations.vocabularyItems.map((item: any) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      })),
      soals: userWithRelations.soals.map((soal: any) => ({
        ...soal,
        createdAt: soal.createdAt.toISOString(),
      })),
       authoredPosts: userWithRelations.authoredPosts.map((post: any) => ({
         ...post,
         createdAt: post.createdAt.toISOString(),
         userLiked: false, // For now, set to false since it's the author's own posts
       })),
      activityLogs: userWithRelations.activityLogs.map((log: any) => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      })),
      // Additional calculated stats
      stats: {
        totalActivities,
        totalXPEarned,
        recentActivitiesCount: recentActivities.length,
        completionRate: userWithRelations._count.materiCompletions > 0
          ? Math.round((userWithRelations._count.kelasCompletions / userWithRelations._count.materiCompletions) * 100)
          : 0,
      },
    };

    return {
      success: true,
      data: serializedUser,
    };
  } catch (error) {
    console.error("Get user profile error:", error);
    return {
      success: false,
      error: "Failed to fetch user profile",
      data: null,
    };
  }
}

export async function updateProfile(data: { name?: string; bio?: string; image?: string }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const userId = session.user.id;

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.image !== undefined) updateData.image = data.image;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        bio: true,
        image: true,
        email: true,
      },
    });

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      success: false,
      error: "Failed to update profile",
    };
  }
}

export async function getUserProfileById(targetUserId: string) {
  try {
    const session = await getServerSession();
    const currentUserId = session?.user?.id;

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        currentStreak: true,
        xp: true,
        level: true,
        // Joined classes (only public ones for other users)
        joinedKelas: {
          where: { isDraft: false },
          select: {
            id: true,
            title: true,
            description: true,
            level: true,
            thumbnail: true,
            icon: true,
            type: true,
            isPaidClass: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                materis: true,
                members: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        // Authored classes (only public ones)
        authoredKelas: {
          where: { isDraft: false },
          select: {
            id: true,
            title: true,
            description: true,
            level: true,
            thumbnail: true,
            icon: true,
            type: true,
            isPaidClass: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                materis: true,
                members: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        // Vocabulary items created by user (only public ones for other users)
        vocabularyItems: {
          where: {
            collection: {
              isPublic: true,
            },
          },
          select: {
            id: true,
            korean: true,
            indonesian: true,
            type: true,
            pos: true,
            isLearned: true,
            createdAt: true,
            collection: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        // Soal (questions) created by user (only public ones for other users)
        soals: {
          where: {
            koleksiSoal: {
              isPrivate: false,
            },
          },
          select: {
            id: true,
            pertanyaan: true,
            difficulty: true,
            explanation: true,
            isActive: true,
            createdAt: true,
            koleksiSoal: {
              select: {
                id: true,
                nama: true,
                deskripsi: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        // Posts authored by user (only published ones)
        authoredPosts: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            description: true,
            htmlDescription: true,
            type: true,
            isPinned: true,
            viewCount: true,
            likeCount: true,
            commentCount: true,
            shareCount: true,
            createdAt: true,
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
                comments: true,
                shares: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        // Activity logs for stats (limited for other users)
        activityLogs: {
          select: {
            id: true,
            type: true,
            xpEarned: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: currentUserId === targetUserId ? 50 : 10, // More for own profile
        },
        // Completion stats
        _count: {
          select: {
            joinedKelas: true,
            vocabularyItems: true,
            soals: true,
            materiCompletions: true,
            kelasCompletions: true,
            authoredKelas: true,
            authoredPosts: true,
            comments: true,
            postLikes: true,
            tryoutParticipations: true,
          },
        },
      },
    });

    if (!targetUser) {
      return {
        success: false,
        error: "Profile not found",
        data: null,
        isOwnProfile: false,
      };
    }

    const isOwnProfile = currentUserId === targetUserId;

    // Type assertion to access the selected relations
    const userWithRelations = targetUser as any;

    // Calculate additional stats
    const totalActivities = userWithRelations.activityLogs.length;
    const totalXPEarned = userWithRelations.activityLogs.reduce((sum: number, log: any) => sum + (log.xpEarned || 0), 0);

    // Get recent activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivities = userWithRelations.activityLogs.filter((log: any) =>
      new Date(log.createdAt) >= sevenDaysAgo
    );

    // Serialize data for client
    const serializedUser = {
      ...userWithRelations,
      createdAt: userWithRelations.createdAt.toISOString(),
      updatedAt: userWithRelations.updatedAt.toISOString(),
      joinedKelas: userWithRelations.joinedKelas.map((kelas: any) => ({
        ...kelas,
        createdAt: kelas.createdAt.toISOString(),
      })),
      authoredKelas: userWithRelations.authoredKelas.map((kelas: any) => ({
        ...kelas,
        createdAt: kelas.createdAt.toISOString(),
      })),
      vocabularyItems: userWithRelations.vocabularyItems.map((item: any) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      })),
      soals: userWithRelations.soals.map((soal: any) => ({
        ...soal,
        createdAt: soal.createdAt.toISOString(),
      })),
      authoredPosts: userWithRelations.authoredPosts.map((post: any) => ({
        ...post,
        createdAt: post.createdAt.toISOString(),
      })),
      activityLogs: userWithRelations.activityLogs.map((log: any) => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      })),
      // Additional calculated stats
      stats: {
        totalActivities,
        totalXPEarned,
        recentActivitiesCount: recentActivities.length,
        completionRate: userWithRelations._count.materiCompletions > 0
          ? Math.round((userWithRelations._count.kelasCompletions / userWithRelations._count.materiCompletions) * 100)
          : 0,
      },
    };

    return {
      success: true,
      data: serializedUser,
      isOwnProfile,
    };
  } catch (error) {
    console.error("Get user profile by ID error:", error);
    return {
      success: false,
      error: "Failed to fetch user profile",
      data: null,
      isOwnProfile: false,
    };
  }
}