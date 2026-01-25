"use server";

import { prisma } from "@/lib/db";
import { assertAuthenticated, assertRole } from "@/lib/auth-actions";
import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { z } from "zod";

// Validation schemas
const registerPushTokenSchema = z.object({
  pushToken: z.string().min(1),
  deviceId: z.string().optional(),
  deviceType: z.enum(["ios", "android"]).optional(),
});

const sendPushNotificationSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(255),
  body: z.string().min(1).max(1000),
  data: z.any().optional(),
});

/**
 * Register or update an Expo push token for the authenticated user
 */
export async function registerPushToken(
  pushToken: string,
  deviceId?: string,
  deviceType?: "ios" | "android"
) {
  try {
    const session = await assertAuthenticated();
    const validData = registerPushTokenSchema.parse({ pushToken, deviceId, deviceType });

    // Check if token already exists for this user
    const existingToken = await prisma.expoPushToken.findUnique({
      where: { pushToken: validData.pushToken },
    });

    let expoPushToken;

    if (existingToken) {
      // Update existing token if it belongs to the same user
      if (existingToken.userId === session.user.id) {
        expoPushToken = await prisma.expoPushToken.update({
          where: { id: existingToken.id },
          data: {
            deviceId: validData.deviceId,
            deviceType: validData.deviceType,
            isActive: true,
            lastUsedAt: new Date(),
          },
        });
      } else {
        // Token belongs to another user, create a new one
        expoPushToken = await prisma.expoPushToken.create({
          data: {
            pushToken: validData.pushToken,
            userId: session.user.id,
            deviceId: validData.deviceId,
            deviceType: validData.deviceType,
            isActive: true,
            lastUsedAt: new Date(),
          },
        });
      }
    } else {
      // Create new token
      expoPushToken = await prisma.expoPushToken.create({
        data: {
          pushToken: validData.pushToken,
          userId: session.user.id,
          deviceId: validData.deviceId,
          deviceType: validData.deviceType,
          isActive: true,
          lastUsedAt: new Date(),
        },
      });
    }

    return { success: true, data: expoPushToken };
  } catch (error) {
    console.error("Register push token error:", error);
    return { success: false, error: "Failed to register push token" };
  }
}

/**
 * Get all active push tokens for the authenticated user
 */
export async function getUserPushTokens() {
  try {
    const session = await assertAuthenticated();

    const pushTokens = await prisma.expoPushToken.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        lastUsedAt: "desc",
      },
    });

    return { success: true, data: pushTokens };
  } catch (error) {
    console.error("Get user push tokens error:", error);
    return { success: false, error: "Failed to fetch push tokens" };
  }
}

/**
 * Delete a specific push token (user can only delete their own)
 */
export async function deletePushToken(tokenId: string) {
  try {
    const session = await assertAuthenticated();

    // Check if the token exists and belongs to the user
    const token = await prisma.expoPushToken.findUnique({
      where: { id: tokenId },
    });

    if (!token) {
      return { success: false, error: "Push token not found" };
    }

    // Only allow users to delete their own tokens
    if (token.userId !== session.user.id) {
      return { success: false, error: "Forbidden" };
    }

    // Delete the token
    await prisma.expoPushToken.delete({
      where: { id: tokenId },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete push token error:", error);
    return { success: false, error: "Failed to delete push token" };
  }
}

/**
 * Send push notification to a user (GURU or ADMIN only)
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: any
) {
  try {
    // Check if user has GURU or ADMIN role
    await assertRole("GURU");

    const validData = sendPushNotificationSchema.parse({ userId, title, body, data });

    // Get all active push tokens for the target user
    const pushTokens = await prisma.expoPushToken.findMany({
      where: {
        userId: validData.userId,
        isActive: true,
      },
    });

    if (pushTokens.length === 0) {
      return {
        success: true,
        sentCount: 0,
        failedCount: 0,
        errors: ["No active push tokens found for user"],
      };
    }

    // Create a new Expo SDK client
    const expo = new Expo();

    // Create push messages
    const messages: ExpoPushMessage[] = pushTokens.map((token) => ({
      to: token.pushToken,
      sound: "default",
      title: validData.title,
      body: validData.body,
      data: validData.data || {},
    }));

    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: any[] = [];
    const errors: string[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Error sending push notification chunk:", error);
        errors.push("Failed to send notification chunk");
      }
    }

    // Check for invalid tokens and mark them as inactive
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const token = pushTokens[i];

      if (ticket.status === "error") {
        failedCount++;
        errors.push(`Error for token ${token.pushToken}: ${ticket.message}`);

        // If the token is invalid, mark it as inactive
        if (
          ticket.details?.error === "DeviceNotRegistered" ||
          ticket.details?.error === "InvalidCredentials" ||
          ticket.details?.error === "MessageTooBig" ||
          ticket.details?.error === "MessageRateExceeded"
        ) {
          await prisma.expoPushToken.update({
            where: { id: token.id },
            data: { isActive: false },
          });
        }
      } else {
        sentCount++;
      }
    }

    return {
      success: true,
      sentCount,
      failedCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Send push notification error:", error);
    return { success: false, error: "Failed to send push notification" };
  }
}
