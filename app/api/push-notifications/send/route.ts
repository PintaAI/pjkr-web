import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

// POST /api/push-notifications/send - Send push notification to a user
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has GURU role
    if (session.user.role !== 'GURU' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only GURU or ADMIN can send push notifications' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, title, body: messageBody, data } = body;

    if (!userId || !title || !messageBody) {
      return NextResponse.json(
        { success: false, error: 'userId, title, and body are required' },
        { status: 400 }
      );
    }

    // Get all active push tokens for the target user
    const pushTokens = await prisma.expoPushToken.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    if (pushTokens.length === 0) {
      return NextResponse.json({
        success: true,
        sentCount: 0,
        failedCount: 0,
        errors: ['No active push tokens found for user'],
      });
    }

    // Create a new Expo SDK client
    const expo = new Expo();

    // Create push messages
    const messages: ExpoPushMessage[] = pushTokens.map((token) => ({
      to: token.pushToken,
      sound: 'default',
      title,
      body: messageBody,
      data: data || {},
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
        console.error('Error sending push notification chunk:', error);
        errors.push('Failed to send notification chunk');
      }
    }

    // Check for invalid tokens and mark them as inactive
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const token = pushTokens[i];

      if (ticket.status === 'error') {
        failedCount++;
        errors.push(`Error for token ${token.pushToken}: ${ticket.message}`);

        // If the token is invalid, mark it as inactive
        if (
          ticket.details?.error === 'DeviceNotRegistered' ||
          ticket.details?.error === 'InvalidCredentials' ||
          ticket.details?.error === 'MessageTooBig' ||
          ticket.details?.error === 'MessageRateExceeded'
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

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send push notification' },
      { status: 500 }
    );
  }
}
