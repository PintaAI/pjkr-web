"use server";

import { prisma } from "@/lib/db";
import { assertAuthenticated } from "@/lib/auth-actions";
import { z } from "zod";

// Schema for email validation
const emailSchema = z.string().email("Invalid email address");

export interface AddMemberResult {
  success: boolean;
  error?: string;
  message?: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export async function addMemberByEmail(data: {
  email: string;
  kelasId: number;
}): Promise<AddMemberResult> {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    // Validate email
    const validatedEmail = emailSchema.parse(data.email);

    // Check if class exists and user is the author
    const kelas = await prisma.kelas.findUnique({
      where: { id: data.kelasId },
      select: { 
        id: true,
        title: true,
        authorId: true
      }
    });

    if (!kelas) {
      return {
        success: false,
        error: "Class not found"
      };
    }

    if (kelas.authorId !== userId) {
      return {
        success: false,
        error: "Only the class author can add members"
      };
    }

    // Find user by email
    const userToAdd = await prisma.user.findUnique({
      where: { email: validatedEmail },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!userToAdd) {
      return {
        success: false,
        error: "User with this email not found"
      };
    }

    // Check if user is already a member
    const isAlreadyMember = await prisma.kelas.findFirst({
      where: {
        id: data.kelasId,
        members: {
          some: { id: userToAdd.id }
        }
      }
    });

    if (isAlreadyMember) {
      return {
        success: false,
        error: "User is already a member of this class"
      };
    }

    // Check if user is the author
    if (userToAdd.id === kelas.authorId) {
      return {
        success: false,
        error: "Cannot add the class author as a member"
      };
    }

    // Add user as member using the existing enrollment pattern
    await prisma.kelas.update({
      where: { id: data.kelasId },
      data: {
        members: {
          connect: { id: userToAdd.id }
        }
      }
    });

    return {
      success: true,
      message: `Successfully added ${userToAdd.name || userToAdd.email} to the class`,
      user: userToAdd
    };

  } catch (error) {
    console.error("Add member error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid email format"
      };
    }

    return {
      success: false,
      error: "Failed to add member"
    };
  }
}

export async function getKelasMembers(kelasId: number) {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    // Check if user is the author of the class
    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      select: { authorId: true }
    });

    if (!kelas || kelas.authorId !== userId) {
      return {
        success: false,
        error: "Access denied"
      };
    }

    // Get all members of the class
    const members = await prisma.kelas.findUnique({
      where: { id: kelasId },
      select: {
        members: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      }
    });

    return {
      success: true,
      data: members
    };

  } catch (error) {
    console.error("Get members error:", error);
    return {
      success: false,
      error: "Failed to get class members"
    };
  }
}

export async function removeMemberFromKelas(kelasId: number, memberUserId: string) {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    // Check if user is the author of the class
    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      select: { authorId: true }
    });

    if (!kelas || kelas.authorId !== userId) {
      return {
        success: false,
        error: "Access denied"
      };
    }

    // Remove the member
    await prisma.kelas.update({
      where: { id: kelasId },
      data: {
        members: {
          disconnect: { id: memberUserId }
        }
      }
    });

    return {
      success: true,
      message: "Member removed successfully"
    };

  } catch (error) {
    console.error("Remove member error:", error);
    return {
      success: false,
      error: "Failed to remove member"
    };
  }
}