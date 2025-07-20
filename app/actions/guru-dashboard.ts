"use server";

import { prisma } from "@/lib/db";
import { assertAuthenticated } from "@/lib/auth-actions";

export async function getGuruDashboardData() {
  try {
    const session = await assertAuthenticated();
    
    if (session.user.role !== "GURU") {
      return { success: false, error: "Not authorized" };
    }

    const userId = session.user.id;

    // Get all classes created by this guru
    const classes = await prisma.kelas.findMany({
      where: { authorId: userId },
      include: {
        _count: { 
          select: { 
            materis: true, 
            members: true 
          } 
        },
        materis: {
          select: { id: true, isDraft: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Calculate stats
    const totalClasses = classes.length;
    const publishedClasses = classes.filter(c => !c.isDraft);
    const draftClasses = classes.filter(c => c.isDraft);
    const totalStudents = classes.reduce((sum, cls) => sum + cls._count.members, 0);
    const totalMateris = classes.reduce((sum, cls) => sum + cls._count.materis, 0);
    
    // Get recent classes (last 3 published)
    const recentClasses = publishedClasses.slice(0, 3).map(cls => ({
      id: cls.id,
      title: cls.title,
      level: cls.level,
      students: cls._count.members,
      materis: cls._count.materis,
      thumbnail: cls.thumbnail,
      createdAt: cls.createdAt
    }));

    const stats = {
      totalClasses,
      publishedClasses: publishedClasses.length,
      draftClasses: draftClasses.length,
      totalStudents,
      totalMateris
    };

    return { 
      success: true, 
      data: { 
        stats, 
        recentClasses,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role
        }
      } 
    };
  } catch (error) {
    console.error("Get guru dashboard data error:", error);
    return { success: false, error: "Failed to get dashboard data" };
  }
}
