import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { isValidEvent } from '@/lib/gamification/eventRegistry'
import { GamificationService } from '@/lib/gamification/service'

// Simple in-memory lock for preventing race conditions
const processingLocks = new Map<string, { timestamp: number }>();

const LOCK_TIMEOUT = 30000; // 30 seconds timeout

// POST /api/gamification/events - Process gamified user actions
export async function POST(request: NextRequest) {
  let session: any;
  
  try {
    // Get authenticated session
    session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check for existing lock to prevent race conditions
    const existingLock = processingLocks.get(session.user.id);
    const now = Date.now();
    
    if (existingLock && (now - existingLock.timestamp) < LOCK_TIMEOUT) {
      return NextResponse.json(
        { success: false, error: 'Request already in progress' },
        { status: 429 }
      )
    }

    // Set lock
    processingLocks.set(session.user.id, { timestamp: now });

    // Parse request body
    const body = await request.json()
    const { event, metadata } = body

    // Validate event type
    if (!event || !isValidEvent(event)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing event type' },
        { status: 400 }
      )
    }

    // Use GamificationService to process the event
    const result = await GamificationService.triggerEvent(
      session.user.id,
      event,
      metadata
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to process gamification event' },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error processing gamification event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process gamification event' },
      { status: 500 }
    )
  } finally {
    // Always release the lock if userId exists
    if (session?.user?.id) {
      processingLocks.delete(session.user.id);
    }
  }
}
