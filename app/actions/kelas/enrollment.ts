"use server";

import { prisma } from "@/lib/db";
import { assertAuthenticated } from "@/lib/auth-actions";
import { redirect } from "next/navigation";

export interface EnrollmentResult {
  success: boolean;
  error?: string;
  message?: string;
  enrolled?: boolean;
  requiresPayment?: boolean;
  paymentUrl?: string;
  price?: number;
  discount?: number;
}

export async function enrollInKelas(kelasId: number, bypassPaymentCheck: boolean = false): Promise<EnrollmentResult> {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;
    const userRole = session.user.role;

    // Get class details
    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      include: {
        members: {
          where: { id: userId },
          select: { id: true }
        }
      }
    });

    if (!kelas) {
      return {
        success: false,
        error: "Class not found"
      };
    }

    if (kelas.isDraft) {
      return {
        success: false,
        error: "Class not available for enrollment"
      };
    }

    // Check if user is already enrolled (skip this check if bypassing payment)
    if (kelas.members.length > 0 && !bypassPaymentCheck) {
      return {
        success: false,
        error: "Already enrolled in this class",
        enrolled: true
      };
    }

    // If bypassing payment check and user is already enrolled, treat as success
    if (kelas.members.length > 0 && bypassPaymentCheck) {
      return {
        success: true,
        message: "User is already enrolled in this class",
        enrolled: true
      };
    }

    // Check if user is the author
    if (kelas.authorId === userId) {
      return {
        success: false,
        error: "Cannot enroll in your own class"
      };
    }

    // Enrollment logic based on user role and class type
    if (userRole === 'MURID' && kelas.isPaidClass && !bypassPaymentCheck) {
      // MURID + Paid Class: Requires payment
      return {
        success: false,
        requiresPayment: true,
        error: "Payment required for this class",
        paymentUrl: `/payment/kelas/${kelasId}`,
        price: kelas.price ? Number(kelas.price) : 0,
        discount: kelas.discount ? Number(kelas.discount) : 0
      };
    }

    // Direct enrollment for:
    // - MURID + Free Class
    // - GURU/ADMIN + Any Class
    await prisma.kelas.update({
      where: { id: kelasId },
      data: {
        members: {
          connect: { id: userId }
        }
      }
    });

    // Add success message based on role
    let message = 'Successfully enrolled in class';
    if (userRole === 'GURU' || userRole === 'ADMIN') {
      message = `Successfully joined class as ${userRole.toLowerCase()}`;
      // TODO: Implement GURU/ADMIN join request logic
    }

    return {
      success: true,
      message,
      enrolled: true
    };

  } catch (error) {
    console.error("Enrollment error:", error);
    return {
      success: false,
      error: "Failed to enroll in class"
    };
  }
}

export async function unenrollFromKelas(kelasId: number): Promise<EnrollmentResult> {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    // Check if class exists and user is enrolled
    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      include: {
        members: {
          where: { id: userId },
          select: { id: true }
        }
      }
    });

    if (!kelas) {
      return {
        success: false,
        error: "Class not found"
      };
    }

    if (kelas.members.length === 0) {
      return {
        success: false,
        error: "Not enrolled in this class",
        enrolled: false
      };
    }

    // Unenroll user
    await prisma.kelas.update({
      where: { id: kelasId },
      data: {
        members: {
          disconnect: { id: userId }
        }
      }
    });

    return {
      success: true,
      message: "Successfully unenrolled from class",
      enrolled: false
    };

  } catch (error) {
    console.error("Unenrollment error:", error);
    return {
      success: false,
      error: "Failed to unenroll from class"
    };
  }
}

export async function checkEnrollmentStatus(kelasId: number) {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      include: {
        members: {
          where: { id: userId },
          select: { id: true }
        }
      }
    });

    if (!kelas) {
      return {
        success: false,
        error: "Class not found"
      };
    }

    const isEnrolled = kelas.members.length > 0;
    const isAuthor = kelas.authorId === userId;

    return {
      success: true,
      isEnrolled,
      isAuthor,
      isPaidClass: kelas.isPaidClass,
      price: kelas.price ? Number(kelas.price) : null,
      discount: kelas.discount ? Number(kelas.discount) : null
    };

  } catch (error) {
    console.error("Check enrollment status error:", error);
    return {
      success: false,
      error: "Failed to check enrollment status"
    };
  }
}

export async function redirectToPayment(kelasId: number) {
  redirect(`/payment/kelas/${kelasId}`);
}