# Server Actions Authentication

This document explains how to protect and secure server actions using the authentication system.

## Table of Contents

1. [Overview](#overview)
2. [Authentication Wrappers](#authentication-wrappers)
3. [Usage Examples](#usage-examples)
4. [Utility Functions](#utility-functions)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)

## Overview

Server actions are server-side functions that can be called from client components. This application provides several wrapper functions and utilities to secure server actions with authentication and authorization checks.

All authentication wrappers are available in [`lib/auth-actions.ts`](../lib/auth-actions.ts).

## Authentication Wrappers

### `withAuth` - Require Authentication

Wraps a server action to require authentication. Redirects to `/auth` if user is not authenticated.

```typescript
import { withAuth } from "@/lib/auth-actions";

export const myProtectedAction = withAuth(async (param1: string, param2: number) => {
  // This code only runs if user is authenticated
  // Access current user via session
  const session = await auth.api.getSession({ headers: await headers() });
  
  return {
    success: true,
    data: `Processed ${param1} with ${param2}`,
    userId: session!.user.id
  };
});
```

**When to use:**
- Any action that requires a logged-in user
- Actions that modify user-specific data
- Actions that access protected resources

### `withRole` - Require Specific Role

Wraps a server action to require a specific user role. Throws an error if the user doesn't have the required role.

```typescript
import { withRole } from "@/lib/auth-actions";

// Only GURU (teachers) can create courses
export const createCourse = withRole("GURU", async (
  title: string, 
  description: string
) => {
  // Only executed if user has GURU role
  const session = await auth.api.getSession({ headers: await headers() });
  
  // Your course creation logic here
  const course = await prisma.course.create({
    data: {
      title,
      description,
      teacherId: session!.user.id,
    },
  });
  
  return {
    success: true,
    courseId: course.id,
    message: `Course "${title}" created successfully`,
  };
});
```

**Available Roles:**
- `MURID` - Student (default role)
- `GURU` - Teacher
- `ADMIN` - Administrator

**When to use:**
- Actions that should only be available to specific user types
- Administrative functions
- Teacher-specific operations

### `withPlan` - Require Subscription Plan

Wraps a server action to require a specific subscription plan. Users with `CUSTOM` plan have access to all features.

```typescript
import { withPlan } from "@/lib/auth-actions";

// Only PREMIUM users can access this feature
export const generateAIContent = withPlan("PREMIUM", async (prompt: string) => {
  // Only executed if user has PREMIUM or CUSTOM plan
  const session = await auth.api.getSession({ headers: await headers() });
  
  // Your premium feature logic here
  const result = await generateContent(prompt);
  
  return {
    success: true,
    content: result,
    creditsUsed: 1,
  };
});
```

**Available Plans:**
- `FREE` - Basic access
- `PREMIUM` - Enhanced features
- `CUSTOM` - Full access (bypasses plan restrictions)

**When to use:**
- Premium features
- Usage-limited operations
- Subscription-gated content

## Usage Examples

### Example 1: Simple Protected Action

```typescript
"use server";

import { withAuth } from "@/lib/auth-actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const updateProfile = withAuth(async (name: string, bio: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  
  // Update user profile
  await prisma.user.update({
    where: { id: session!.user.id },
    data: { name, bio },
  });
  
  return { success: true, message: "Profile updated successfully" };
});
```

**Usage in component:**

```typescript
"use client";

import { updateProfile } from "@/actions/profile";
import { useState } from "react";

export function ProfileForm() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateProfile(name, bio);
      console.log(result.message);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
      <button type="submit">Update Profile</button>
    </form>
  );
}
```

### Example 2: Role-Based Action

```typescript
"use server";

import { withRole } from "@/lib/auth-actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const deleteUser = withRole("ADMIN", async (userId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  
  // Only admins can delete users
  await prisma.user.delete({
    where: { id: userId },
  });
  
  // Log the action
  await prisma.auditLog.create({
    data: {
      action: "USER_DELETED",
      performedBy: session!.user.id,
      targetUserId: userId,
    },
  });
  
  return { success: true, message: "User deleted successfully" };
});
```

### Example 3: Plan-Based Action

```typescript
"use server";

import { withPlan } from "@/lib/auth-actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const exportData = withPlan("PREMIUM", async (format: "csv" | "json") => {
  const session = await auth.api.getSession({ headers: await headers() });
  
  // Fetch user's data
  const userData = await prisma.userActivity.findMany({
    where: { userId: session!.user.id },
  });
  
  // Format data based on requested format
  const formattedData = format === "csv" 
    ? convertToCSV(userData)
    : JSON.stringify(userData, null, 2);
  
  return {
    success: true,
    data: formattedData,
    format,
  };
});
```

### Example 4: Combined Authentication with Multiple Checks

```typescript
"use server";

import { assertRole, assertPlan } from "@/lib/auth-actions";

export async function createPremiumCourse(courseData: CourseData) {
  // Manually check both role and plan
  const session = await assertRole("GURU");
  await assertPlan("PREMIUM");
  
  // Create premium course
  const course = await prisma.course.create({
    data: {
      ...courseData,
      isPremium: true,
      teacherId: session.user.id,
    },
  });
  
  return { success: true, courseId: course.id };
}
```

### Example 5: Gradual Authentication Check

```typescript
"use server";

import { getCurrentUser } from "@/lib/auth-actions";

export async function getPublicCourseOrPrivateDetails(courseId: string) {
  const user = await getCurrentUser();
  
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      // Include private details only if user is authenticated and enrolled
      materials: user ? {
        where: {
          OR: [
            { isPublic: true },
            { 
              course: {
                enrollments: {
                  some: { userId: user.id }
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
  
  return {
    course,
    hasPrivateAccess: !!user,
  };
}
```

## Utility Functions

### `getCurrentUser()`

Get the current user without requiring authentication. Returns `null` if not authenticated.

```typescript
import { getCurrentUser } from "@/lib/auth-actions";

export async function myAction() {
  const user = await getCurrentUser();
  
  if (user) {
    console.log("Authenticated as:", user.email);
  } else {
    console.log("Anonymous user");
  }
}
```

### `assertAuthenticated()`

Assert that the user is authenticated. Throws an error if not.

```typescript
import { assertAuthenticated } from "@/lib/auth-actions";

export async function myProtectedAction() {
  const session = await assertAuthenticated();
  // Continue with authenticated logic
  return { userId: session.user.id };
}
```

### `assertRole(requiredRole)`

Assert that the user has a specific role. Throws an error if not.

```typescript
import { assertRole } from "@/lib/auth-actions";

export async function adminAction() {
  const session = await assertRole("ADMIN");
  // Only admins reach this point
  return { adminId: session.user.id };
}
```

### `assertPlan(requiredPlan)`

Assert that the user has a specific plan. Throws an error if not.

```typescript
import { assertPlan } from "@/lib/auth-actions";

export async function premiumAction() {
  const session = await assertPlan("PREMIUM");
  // Only premium users reach this point
  return { userId: session.user.id };
}
```

## Error Handling

### Handling Authentication Errors

```typescript
"use client";

import { myProtectedAction } from "@/actions/my-action";

export function MyComponent() {
  const handleAction = async () => {
    try {
      const result = await myProtectedAction();
      console.log("Success:", result);
    } catch (error) {
      if (error instanceof Error) {
        // Handle specific errors
        if (error.message.includes("Authentication required")) {
          console.log("User not authenticated");
          // Redirect to login
        } else if (error.message.includes("Access denied")) {
          console.log("Insufficient permissions");
          // Show error message
        } else {
          console.error("Unexpected error:", error);
        }
      }
    }
  };
  
  return <button onClick={handleAction}>Execute Action</button>;
}
```

### Server-Side Error Handling

```typescript
"use server";

import { withAuth } from "@/lib/auth-actions";

export const safeAction = withAuth(async (data: string) => {
  try {
    // Your logic here
    const result = await processData(data);
    return { success: true, data: result };
  } catch (error) {
    // Log error securely on server
    console.error("Action failed:", error);
    
    // Return safe error to client
    return {
      success: false,
      error: "Failed to process data. Please try again.",
    };
  }
});
```

## Best Practices

### 1. Always Validate Input

```typescript
"use server";

import { withAuth } from "@/lib/auth-actions";
import { z } from "zod";

const inputSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500),
});

export const createPost = withAuth(async (input: unknown) => {
  // Validate input
  const validated = inputSchema.parse(input);
  
  const session = await auth.api.getSession({ headers: await headers() });
  
  const post = await prisma.post.create({
    data: {
      ...validated,
      authorId: session!.user.id,
    },
  });
  
  return { success: true, postId: post.id };
});
```

### 2. Use Appropriate Wrapper

```typescript
// ✅ Good: Use withAuth for simple authentication
export const updateSettings = withAuth(async (settings) => { /* ... */ });

// ✅ Good: Use withRole for role-specific actions
export const approveCourse = withRole("ADMIN", async (courseId) => { /* ... */ });

// ✅ Good: Use withPlan for subscription features
export const aiGenerate = withPlan("PREMIUM", async (prompt) => { /* ... */ });

// ❌ Bad: Manual checks when wrapper exists
export const badAction = async (data) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  // Use withAuth instead!
};
```

### 3. Return Consistent Response Format

```typescript
"use server";

type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export const myAction = withAuth(async (input: string): Promise<ActionResult<string>> => {
  try {
    const result = await process(input);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Processing failed" };
  }
});
```

### 4. Log Important Actions

```typescript
"use server";

import { withRole } from "@/lib/auth-actions";

export const deleteContent = withRole("ADMIN", async (contentId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  
  // Log before deletion
  await prisma.auditLog.create({
    data: {
      action: "DELETE_CONTENT",
      performedBy: session!.user.id,
      targetId: contentId,
      timestamp: new Date(),
    },
  });
  
  await prisma.content.delete({ where: { id: contentId } });
  
  return { success: true };
});
```

### 5. Handle Race Conditions

```typescript
"use server";

import { withAuth } from "@/lib/auth-actions";

export const enrollInCourse = withAuth(async (courseId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  
  // Check if already enrolled
  const existing = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session!.user.id,
        courseId,
      },
    },
  });
  
  if (existing) {
    return { success: false, error: "Already enrolled" };
  }
  
  // Create enrollment
  const enrollment = await prisma.enrollment.create({
    data: {
      userId: session!.user.id,
      courseId,
    },
  });
  
  return { success: true, enrollmentId: enrollment.id };
});
```

### 6. Use Transactions for Multiple Operations

```typescript
"use server";

import { withAuth } from "@/lib/auth-actions";

export const purchaseCourse = withAuth(async (courseId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  
  // Use transaction to ensure all operations succeed or fail together
  const result = await prisma.$transaction(async (tx) => {
    // Create payment record
    const payment = await tx.payment.create({
      data: {
        userId: session!.user.id,
        courseId,
        amount: 9900, // $99.00
        status: "completed",
      },
    });
    
    // Create enrollment
    const enrollment = await tx.enrollment.create({
      data: {
        userId: session!.user.id,
        courseId,
      },
    });
    
    return { payment, enrollment };
  });
  
  return { success: true, ...result };
});
```

## Testing Server Actions

### Unit Testing

```typescript
import { createCourse } from "@/actions/courses";
import { auth } from "@/lib/auth";

jest.mock("@/lib/auth");
jest.mock("next/headers");

describe("createCourse", () => {
  it("should create course for GURU role", async () => {
    // Mock authenticated GURU user
    (auth.api.getSession as jest.Mock).mockResolvedValue({
      user: { id: "123", role: "GURU", email: "teacher@example.com" },
    });
    
    const result = await createCourse("Test Course", "Description");
    
    expect(result.success).toBe(true);
    expect(result.message).toContain("Test Course");
  });
  
  it("should reject MURID role", async () => {
    // Mock authenticated MURID user
    (auth.api.getSession as jest.Mock).mockResolvedValue({
      user: { id: "456", role: "MURID", email: "student@example.com" },
    });
    
    await expect(
      createCourse("Test Course", "Description")
    ).rejects.toThrow("Access denied");
  });
});
```

## Related Documentation

- [Authentication Documentation](./authentication.md) - Main authentication guide
- [API Routes Documentation](./api-routes.md) - API endpoint authentication
- [Middleware Configuration](./middleware.md) - Route protection

## Common Patterns

### Pattern 1: Owner-Only Actions

```typescript
"use server";

import { withAuth } from "@/lib/auth-actions";

export const updatePost = withAuth(async (postId: string, content: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  
  // Verify ownership
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });
  
  if (!post) {
    return { success: false, error: "Post not found" };
  }
  
  if (post.authorId !== session!.user.id) {
    return { success: false, error: "You can only update your own posts" };
  }
  
  // Update post
  await prisma.post.update({
    where: { id: postId },
    data: { content },
  });
  
  return { success: true };
});
```

### Pattern 2: Incremental Permissions

```typescript
"use server";

import { getCurrentUser } from "@/lib/auth-actions";

export async function getPostDetails(postId: string) {
  const user = await getCurrentUser();
  
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      // Include author details only for authenticated users
      author: !!user,
      // Include private comments only for post author
      comments: {
        where: user ? {
          OR: [
            { isPublic: true },
            { authorId: user.id },
          ]
        } : { isPublic: true }
      }
    }
  });
  
  return post;
}
```

## Troubleshooting

### Error: "Authentication required"

**Cause**: Action requires authentication but user is not logged in.

**Solution**: Ensure user is authenticated before calling the action, or handle the error gracefully.

### Error: "Access denied. Required role: X"

**Cause**: User doesn't have the required role for the action.

**Solution**: Check user's role before showing UI elements that trigger role-specific actions.

### Error: "Access denied. Required plan: X"

**Cause**: User doesn't have the required subscription plan.

**Solution**: Show upgrade prompt or disable premium features for non-premium users.

### Headers Error

**Cause**: Trying to access headers in client-side code.

**Solution**: Ensure all authentication code runs on the server. Use `"use server"` directive.

```typescript
// ✅ Correct
"use server";
import { headers } from "next/headers";

export async function myAction() {
  const session = await auth.api.getSession({ headers: await headers() });
}

// ❌ Wrong - missing "use server"
export async function myAction() {
  const session = await auth.api.getSession({ headers: await headers() });
}