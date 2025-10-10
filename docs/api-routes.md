# API Routes Authentication

This document explains how to create and protect API routes in the application using the Better Auth authentication system.

## Table of Contents

1. [Overview](#overview)
2. [Better Auth API Routes](#better-auth-api-routes)
3. [Creating Custom API Routes](#creating-custom-api-routes)
4. [Authentication Methods](#authentication-methods)
5. [Usage Examples](#usage-examples)
6. [Error Handling](#error-handling)
7. [Testing API Routes](#testing-api-routes)
8. [Best Practices](#best-practices)

## Overview

The application uses **Better Auth** for authentication, which automatically handles authentication API routes at `/api/auth/*`. For custom API routes, you can use the same authentication utilities available for server actions.

## Better Auth API Routes

Better Auth automatically provides the following API endpoints:

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/sign-up/email` | POST | Register a new user with email/password |
| `/api/auth/sign-in/email` | POST | Sign in with email/password |
| `/api/auth/sign-in/social` | POST | Sign in with social provider (Google) |
| `/api/auth/sign-out` | POST | Sign out current user |
| `/api/auth/get-session` | GET | Get current session |

### Session Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/session` | GET | Get current session details |
| `/api/auth/session` | POST | Update session |
| `/api/auth/session` | DELETE | Delete session (sign out) |

### User Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/user` | GET | Get current user details |
| `/api/auth/user` | PATCH | Update user profile |

> **Note**: These routes are automatically handled by Better Auth. You don't need to implement them manually.

## Creating Custom API Routes

Custom API routes should be placed in the `app/api` directory following Next.js App Router conventions.

### Basic API Route Structure

```typescript
// app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Hello World" });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}
```

## Authentication Methods

### Method 1: Using `getServerSession`

The recommended approach for checking authentication in API routes:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  
  return NextResponse.json({
    message: "Protected data",
    userId: session.user.id,
  });
}
```

### Method 2: Using `auth.api.getSession`

Direct method using Better Auth:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  return NextResponse.json({
    user: session.user,
  });
}
```

### Method 3: Role-Based Authorization

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  
  // Check role
  const userRole = session.user.role as string;
  if (userRole !== "GURU" && userRole !== "ADMIN") {
    return NextResponse.json(
      { error: "Access denied. Teacher or Admin role required." },
      { status: 403 }
    );
  }
  
  // Process request for authorized users
  const body = await request.json();
  // ... your logic here
  
  return NextResponse.json({ success: true });
}
```

## Usage Examples

### Example 1: Public API Route

```typescript
// app/api/public/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  // No authentication required for public courses
  const courses = await prisma.course.findMany({
    where: { isPublic: true },
    select: {
      id: true,
      title: true,
      description: true,
      thumbnail: true,
    },
  });
  
  return NextResponse.json({ courses });
}
```

### Example 2: Protected User API Route

```typescript
// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  
  const profile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      xp: true,
      level: true,
      currentStreak: true,
    },
  });
  
  return NextResponse.json({ profile });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  
  const body = await request.json();
  
  const updatedProfile = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: body.name,
      // Only update fields that are allowed
    },
  });
  
  return NextResponse.json({ profile: updatedProfile });
}
```

### Example 3: Admin-Only API Route

```typescript
// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  
  // Check authentication
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  
  // Check admin role
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }
  
  // Get query parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  
  const users = await prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
  
  const total = await prisma.user.count();
  
  return NextResponse.json({
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

### Example 4: Premium Feature API Route

```typescript
// app/api/premium/ai-generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  
  // Check premium plan
  const userPlan = (session.user as any).accessTier;
  if (userPlan !== "PREMIUM" && userPlan !== "CUSTOM") {
    return NextResponse.json(
      { error: "Premium subscription required" },
      { status: 403 }
    );
  }
  
  const { prompt } = await request.json();
  
  // Generate AI content
  const result = await generateAIContent(prompt);
  
  return NextResponse.json({
    success: true,
    content: result,
  });
}
```

### Example 5: Dynamic Route with Authentication

```typescript
// app/api/courses/[courseId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const session = await getServerSession();
  const { courseId } = params;
  
  // Public course info
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      // Include materials only if user is enrolled
      materials: session ? {
        where: {
          OR: [
            { isPublic: true },
            {
              course: {
                enrollments: {
                  some: { userId: session.user.id }
                }
              }
            }
          ]
        }
      } : {
        where: { isPublic: true }
      }
    }
  });
  
  if (!course) {
    return NextResponse.json(
      { error: "Course not found" },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ course });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  
  const { courseId } = params;
  const body = await request.json();
  
  // Verify ownership
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  
  if (!course) {
    return NextResponse.json(
      { error: "Course not found" },
      { status: 404 }
    );
  }
  
  if (course.teacherId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "You can only update your own courses" },
      { status: 403 }
    );
  }
  
  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data: body,
  });
  
  return NextResponse.json({ course: updatedCourse });
}
```

### Example 6: Batch Operations API

```typescript
// app/api/courses/batch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  
  const { courseIds } = await request.json();
  
  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    return NextResponse.json(
      { error: "courseIds must be a non-empty array" },
      { status: 400 }
    );
  }
  
  // Enroll in multiple courses
  const enrollments = await prisma.$transaction(
    courseIds.map(courseId =>
      prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId,
          },
        },
        create: {
          userId: session.user.id,
          courseId,
        },
        update: {},
      })
    )
  );
  
  return NextResponse.json({
    success: true,
    enrolled: enrollments.length,
  });
}
```

## Error Handling

### Standard Error Responses

```typescript
// Unauthorized (401)
return NextResponse.json(
  { error: "Authentication required" },
  { status: 401 }
);

// Forbidden (403)
return NextResponse.json(
  { error: "Access denied" },
  { status: 403 }
);

// Not Found (404)
return NextResponse.json(
  { error: "Resource not found" },
  { status: 404 }
);

// Bad Request (400)
return NextResponse.json(
  { error: "Invalid request data" },
  { status: 400 }
);

// Internal Server Error (500)
return NextResponse.json(
  { error: "Internal server error" },
  { status: 500 }
);
```

### Comprehensive Error Handler

```typescript
// app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { z } from "zod";

const requestSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500),
});

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validated = requestSchema.parse(body);
    
    // Process request
    const result = await processData(validated);
    
    return NextResponse.json({ success: true, data: result });
    
  } catch (error) {
    // Validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    
    // Log error
    console.error("API Error:", error);
    
    // Generic error response
    return NextResponse.json(
      { error: "An error occurred processing your request" },
      { status: 500 }
    );
  }
}
```

## Testing API Routes

### Using Fetch API

```typescript
// Client-side usage
async function fetchProtectedData() {
  try {
    const response = await fetch("/api/user/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important for cookies
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Request failed");
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
```

### Using Next.js Server Actions

```typescript
"use server";

export async function callAPI() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/endpoint`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: "value" }),
  });
  
  return response.json();
}
```

### Unit Testing

```typescript
import { GET } from "@/app/api/user/profile/route";
import { getServerSession } from "@/lib/session";
import { NextRequest } from "next/server";

jest.mock("@/lib/session");

describe("GET /api/user/profile", () => {
  it("should return 401 if not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    
    const request = new NextRequest("http://localhost:3000/api/user/profile");
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });
  
  it("should return user profile if authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "123", email: "test@example.com" },
    });
    
    const request = new NextRequest("http://localhost:3000/api/user/profile");
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.profile).toBeDefined();
  });
});
```

## Best Practices

### 1. Always Validate Input

```typescript
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1).max(100),
  amount: z.number().positive(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = schema.parse(body); // Throws if invalid
  // ... use validated data
}
```

### 2. Use Proper HTTP Status Codes

```typescript
// 200 - OK (successful GET)
return NextResponse.json({ data });

// 201 - Created (successful POST creating resource)
return NextResponse.json({ data }, { status: 201 });

// 204 - No Content (successful DELETE)
return new NextResponse(null, { status: 204 });

// 400 - Bad Request (validation error)
return NextResponse.json({ error: "Invalid input" }, { status: 400 });

// 401 - Unauthorized (not authenticated)
return NextResponse.json({ error: "Authentication required" }, { status: 401 });

// 403 - Forbidden (authenticated but not authorized)
return NextResponse.json({ error: "Access denied" }, { status: 403 });

// 404 - Not Found
return NextResponse.json({ error: "Not found" }, { status: 404 });

// 500 - Internal Server Error
return NextResponse.json({ error: "Server error" }, { status: 500 });
```

### 3. Implement Rate Limiting

```typescript
// Simple in-memory rate limiter (use Redis in production)
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string, limit: number = 100): boolean {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);
  
  if (!userLimit || now > userLimit.resetAt) {
    rateLimiter.set(userId, {
      count: 1,
      resetAt: now + 60000, // 1 minute
    });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  if (!checkRateLimit(session.user.id)) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }
  
  // Process request...
}
```

### 4. Add CORS Headers (if needed)

```typescript
export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data: "value" });
  
  // Add CORS headers
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  return response;
}
```

### 5. Log Important Operations

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  
  // Log deletion attempt
  console.log(`[API] User ${session?.user.id} deleting resource ${params.id}`);
  
  // Perform deletion
  await prisma.resource.delete({ where: { id: params.id } });
  
  // Log success
  console.log(`[API] Resource ${params.id} deleted successfully`);
  
  return new NextResponse(null, { status: 204 });
}
```

### 6. Use Consistent Response Format

```typescript
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json<ApiResponse<typeof data>>({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Failed to fetch data",
      },
      { status: 500 }
    );
  }
}
```

## Calling API Routes

### From Client Components

```typescript
"use client";

import { useState } from "react";

export function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/your-endpoint", {
        credentials: "include", // Important for cookies
      });
      
      if (!response.ok) {
        throw new Error("Request failed");
      }
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={fetchData} disabled={loading}>
        {loading ? "Loading..." : "Fetch Data"}
      </button>
    </div>
  );
}
```

### From Server Components

```typescript
// Server Component
export default async function Page() {
  // Call API route from server
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/endpoint`, {
    cache: "no-store", // Disable caching
  });
  
  const data = await response.json();
  
  return <div>{JSON.stringify(data)}</div>;
}
```

## Related Documentation

- [Authentication Documentation](./authentication.md) - Main authentication guide
- [Server Actions Documentation](./server-actions.md) - Server action authentication
- [Middleware Configuration](../middleware.ts) - Route protection

## Troubleshooting

### Issue: Session Not Found in API Route

**Cause**: Cookies not being sent with request.

**Solution**: Ensure `credentials: "include"` is set in fetch requests:

```typescript
fetch("/api/endpoint", {
  credentials: "include",
});
```

### Issue: CORS Errors

**Cause**: Missing CORS headers for cross-origin requests.

**Solution**: Add CORS headers to response (see Best Practices section).

### Issue: 401 Errors Despite Being Logged In

**Cause**: Session cookie not being read correctly.

**Solution**: Verify Better Auth configuration and check that middleware is not interfering.

### Issue: TypeScript Errors with Request/Response

**Solution**: Use proper Next.js types:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ data: "value" });
}