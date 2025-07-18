"use server";

import { prisma } from "@/lib/db";
import { UserRoles } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface UserWithStats {
  id: string;
  email: string;
  name: string | null;
  role: UserRoles;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  currentStreak: number;
  xp: number;
  level: number;
  // Calculated fields
  isActive: boolean;
  lastLoginAt?: Date;
  totalPosts: number;
  totalClasses: number;
}

export interface UserFilters {
  search?: string;
  role?: UserRoles | "ALL";
  status?: "ALL" | "ACTIVE" | "INACTIVE";
  page?: number;
  limit?: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  teacherCount: number;
  studentCount: number;
  adminCount: number;
  newUsersThisWeek: number;
  verifiedUsers: number;
}

// Get all users with pagination and filtering
export async function getAllUsers(filters: UserFilters = {}) {
  try {
    const {
      search = "",
      role = "ALL",
      status = "ALL", 
      page = 1,
      limit = 10
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};

    // Search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ];
    }

    // Role filter
    if (role !== "ALL") {
      whereClause.role = role;
    }

    // Get users with related data
    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        sessions: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        authoredPosts: {
          select: { id: true }
        },
        authoredKelas: {
          select: { id: true }
        },
        _count: {
          select: {
            authoredPosts: true,
            authoredKelas: true,
            sessions: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalUsers = await prisma.user.count({
      where: whereClause
    });

    // Transform data to include calculated fields
    const usersWithStats: UserWithStats[] = users.map(user => {
      const lastSession = user.sessions[0];
      const isActive = lastSession 
        ? new Date(lastSession.createdAt).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000) // Active if logged in within 30 days
        : false;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        currentStreak: user.currentStreak,
        xp: user.xp,
        level: user.level,
        isActive: status === "ALL" ? isActive : status === "ACTIVE" ? isActive : !isActive,
        lastLoginAt: lastSession?.createdAt,
        totalPosts: user._count.authoredPosts,
        totalClasses: user._count.authoredKelas
      };
    });

    // Apply status filter after transformation
    const filteredUsers = status === "ALL" 
      ? usersWithStats
      : usersWithStats.filter(user => 
          status === "ACTIVE" ? user.isActive : !user.isActive
        );

    return {
      users: filteredUsers,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      hasNextPage: page < Math.ceil(totalUsers / limit),
      hasPrevPage: page > 1
    };

  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

// Get user statistics
export async function getUserStats(): Promise<UserStats> {
  try {
    const [
      totalUsers,
      roleStats,
      verifiedUsers,
      newUsersThisWeek,
      activeUsers
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Role statistics
      prisma.user.groupBy({
        by: ["role"],
        _count: true
      }),
      
      // Verified users
      prisma.user.count({
        where: { emailVerified: true }
      }),
      
      // New users this week
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Active users (logged in within 30 days)
      prisma.user.count({
        where: {
          sessions: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              }
            }
          }
        }
      })
    ]);

    // Process role stats
    const roleStatsMap = roleStats.reduce((acc, stat) => {
      acc[stat.role] = stat._count;
      return acc;
    }, {} as Record<UserRoles, number>);

    return {
      totalUsers,
      activeUsers,
      teacherCount: roleStatsMap.GURU || 0,
      studentCount: roleStatsMap.MURID || 0,
      adminCount: roleStatsMap.ADMIN || 0,
      newUsersThisWeek,
      verifiedUsers
    };

  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw new Error("Failed to fetch user statistics");
  }
}

// Get user by ID
export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        sessions: {
          orderBy: { createdAt: "desc" },
          take: 5
        },
        authoredKelas: {
          select: { id: true, title: true, createdAt: true }
        },
        authoredPosts: {
          select: { id: true, title: true, createdAt: true },
          take: 5
        },
        _count: {
          select: {
            authoredPosts: true,
            authoredKelas: true,
            sessions: true,
            activityLogs: true
          }
        }
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user");
  }
}

// Update user
export async function updateUser(id: string, data: {
  name?: string;
  email?: string;
  role?: UserRoles;
  emailVerified?: boolean;
}) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    revalidatePath("/dashboard/admin/users");
    return user;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

// Delete user
export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id }
    });

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}

// Toggle user email verification
export async function toggleUserEmailVerification(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { emailVerified: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        emailVerified: !user.emailVerified,
        updatedAt: new Date()
      }
    });

    revalidatePath("/dashboard/admin/users");
    return updatedUser;
  } catch (error) {
    console.error("Error toggling email verification:", error);
    throw new Error("Failed to toggle email verification");
  }
}

// Create new user
export async function createUser(data: {
  name: string;
  email: string;
  role: UserRoles;
  emailVerified?: boolean;
}) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        emailVerified: data.emailVerified || false
      }
    });

    revalidatePath("/dashboard/admin/users");
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
}

// Get recent user activities
export async function getRecentUserActivities(limit: number = 10) {
  try {
    const activities = await prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return activities;
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    throw new Error("Failed to fetch recent activities");
  }
}

// Bulk update users
export async function bulkUpdateUsers(userIds: string[], data: {
  role?: UserRoles;
  emailVerified?: boolean;
}) {
  try {
    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds }
      },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    revalidatePath("/dashboard/admin/users");
    return result;
  } catch (error) {
    console.error("Error bulk updating users:", error);
    throw new Error("Failed to bulk update users");
  }
}

// Bulk delete users
export async function bulkDeleteUsers(userIds: string[]) {
  try {
    const result = await prisma.user.deleteMany({
      where: {
        id: { in: userIds }
      }
    });

    revalidatePath("/dashboard/admin/users");
    return result;
  } catch (error) {
    console.error("Error bulk deleting users:", error);
    throw new Error("Failed to bulk delete users");
  }
}

// Search users
export async function searchUsers(query: string, limit: number = 10) {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true
      },
      take: limit,
      orderBy: { createdAt: "desc" }
    });

    return users;
  } catch (error) {
    console.error("Error searching users:", error);
    throw new Error("Failed to search users");
  }
}
