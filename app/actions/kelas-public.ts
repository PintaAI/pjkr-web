"use server";

import { prisma } from "@/lib/db";
import { KelasType, Difficulty } from "@prisma/client";

export interface GetKelasListParams {
  type?: KelasType;
  level?: Difficulty;
  search?: string;
  limit?: number;
  offset?: number;
}

// Client-side action for filtering (called from client components)
export async function filterKelas(params: GetKelasListParams) {
  return getPublishedKelasList(params);
}

// Get published kelas list for public display
export async function getPublishedKelasList({
  type,
  level,
  search,
  limit = 12,
  offset = 0,
}: GetKelasListParams = {}) {
  try {
    const where: any = {
      isDraft: false, // Only show published classes
    };

    if (type) where.type = type;
    if (level) where.level = level;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [kelas, total] = await Promise.all([
      prisma.kelas.findMany({
        where,
        include: {
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
        take: limit,
        skip: offset,
      }),
      prisma.kelas.count({ where }),
    ]);

    return {
      success: true,
      data: kelas,
      meta: {
        total,
        offset,
        limit,
        hasMore: offset + limit < total,
      },
    };
  } catch (error) {
    console.error("Get published kelas list error:", error);
    return {
      success: false,
      error: "Failed to fetch classes",
      data: [],
      meta: { total: 0, offset: 0, limit: 0, hasMore: false },
    };
  }
}

// Get kelas statistics
export async function getKelasStats() {
  try {
    const [totalClasses, totalStudents, typeStats, levelStats] = await Promise.all([
      prisma.kelas.count({ where: { isDraft: false } }),
      prisma.user.count({ where: { role: "MURID" } }),
      prisma.kelas.groupBy({
        by: ["type"],
        where: { isDraft: false },
        _count: { id: true },
      }),
      prisma.kelas.groupBy({
        by: ["level"],
        where: { isDraft: false },
        _count: { id: true },
      }),
    ]);

    return {
      success: true,
      data: {
        totalClasses,
        totalStudents,
        typeStats,
        levelStats,
      },
    };
  } catch (error) {
    console.error("Get kelas stats error:", error);
    return {
      success: false,
      error: "Failed to fetch statistics",
      data: null,
    };
  }
}
