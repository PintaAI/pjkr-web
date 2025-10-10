# Authentication & API Documentation

Welcome to the authentication and API documentation for this application. This documentation provides comprehensive guides for implementing authentication, authorization, server actions, and API routes.

## 📚 Documentation Overview

This documentation is organized into the following sections:

### 1. [Authentication & Authorization](./authentication.md)
**Complete guide to the authentication system**

Learn about:
- Better Auth integration
- User roles and permissions (MURID, GURU, ADMIN)
- Session management (client and server-side)
- Social login (Google OAuth)
- Email/password authentication
- Middleware route protection
- Environment configuration

**Start here if you're new to the authentication system.**

### 2. [Server Actions](./server-actions.md)
**Protecting and securing server actions**

Learn about:
- Authentication wrappers (`withAuth`, `withRole`, `withPlan`)
- Utility functions for session management
- Role-based access control
- Plan-based access control (FREE, PREMIUM, CUSTOM)
- Error handling patterns
- Best practices and common patterns
- Testing server actions

**Read this when implementing protected server-side logic.**

### 3. [API Routes](./api-routes.md)
**Creating and protecting API endpoints**

Learn about:
- Better Auth built-in endpoints
- Creating custom API routes
- Authentication methods for API routes
- Request validation and error handling
- Rate limiting
- CORS configuration
- Testing API routes

**Reference this when building REST API endpoints.**

## 🚀 Quick Start

### For Users New to the System

1. Start with [Authentication & Authorization](./authentication.md) to understand the overall system
2. Review the user roles and session management sections
3. Move to specific implementation guides based on your needs

### For Frontend Developers

```typescript
// Client-side authentication
import { useSession, signIn, signOut } from "@/lib/auth-client";

function MyComponent() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;
  
  return <div>Welcome, {session.user.name}!</div>;
}
```

**Read more:** [Authentication - Client-Side](./authentication.md#client-side-authentication)

### For Backend Developers

```typescript
// Server-side authentication
import { getServerSession } from "@/lib/session";

export default async function ServerComponent() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/auth");
  }
  
  return <div>User ID: {session.user.id}</div>;
}
```

**Read more:** [Authentication - Server-Side](./authentication.md#server-side-authentication)

### For Server Action Developers

```typescript
"use server";
import { withAuth } from "@/lib/auth-actions";

export const myAction = withAuth(async (data: string) => {
  // Only authenticated users can execute this
  return { success: true };
});
```

**Read more:** [Server Actions Documentation](./server-actions.md)

### For API Route Developers

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
  
  return NextResponse.json({ data: "Protected data" });
}
```

**Read more:** [API Routes Documentation](./api-routes.md)

## 🔐 Authentication Flow

### Sign Up Flow

```
User enters email/password
  ↓
Better Auth creates account
  ↓
User registration logged
  ↓
Auto sign-in
  ↓
Redirect to /home
```

### Sign In Flow

```
User enters credentials
  ↓
Better Auth validates
  ↓
Session created
  ↓
Redirect based on role:
  • MURID → /home
  • GURU/ADMIN → /dashboard
```

## 👥 User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **MURID** | Student (default) | Basic access to courses and learning materials |
| **GURU** | Teacher | Can create and manage courses |
| **ADMIN** | Administrator | Full system access and user management |

## 💎 Subscription Tiers

| Tier | Description |
|------|-------------|
| **FREE** | Basic features |
| **PREMIUM** | Enhanced features and AI tools |
| **CUSTOM** | Full access with custom permissions |

## 🛣️ Route Protection

### Public Routes
- `/` - Landing page
- `/about`, `/contact`, `/pricing`, `/features`

### Auth Routes
- `/auth` - Sign in/up page
- `/auth/reset-password`, `/auth/verify-email`

### Protected Routes
- `/home` - User dashboard
- `/profile`, `/settings`
- `/kelas`, `/vocabulary`, `/soal`, `/game`

**Learn more:** [Middleware Protection](./authentication.md#middleware-protection)

## 📦 Key Components

### Authentication Files

| File | Purpose |
|------|---------|
| [`lib/auth.ts`](../lib/auth.ts) | Better Auth configuration and setup |
| [`lib/auth-client.ts`](../lib/auth-client.ts) | Client-side authentication utilities |
| [`lib/auth-actions.ts`](../lib/auth-actions.ts) | Server action authentication wrappers |
| [`lib/session.ts`](../lib/session.ts) | Server-side session utilities |
| [`middleware.ts`](../middleware.ts) | Route protection middleware |
| [`lib/routes.ts`](../lib/routes.ts) | Route configuration |

## 🔧 Common Patterns

### Pattern 1: Protected Server Component

```typescript
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/auth");
  }
  
  return <div>Protected content</div>;
}
```

### Pattern 2: Role-Based UI

```typescript
import { getServerSession } from "@/lib/session";

export default async function Page() {
  const session = await getServerSession();
  const isTeacher = session?.user.role === "GURU";
  
  return (
    <div>
      {isTeacher && <TeacherDashboard />}
      {!isTeacher && <StudentView />}
    </div>
  );
}
```

### Pattern 3: Protected Server Action

```typescript
"use server";
import { withAuth } from "@/lib/auth-actions";

export const updateProfile = withAuth(async (name: string) => {
  // User is guaranteed to be authenticated here
  return { success: true };
});
```

### Pattern 4: Owner-Only Access

```typescript
"use server";
import { withAuth } from "@/lib/auth-actions";

export const deletePost = withAuth(async (postId: string) => {
  const session = await getServerSession();
  const post = await prisma.post.findUnique({ where: { id: postId } });
  
  if (post.authorId !== session.user.id) {
    throw new Error("You can only delete your own posts");
  }
  
  await prisma.post.delete({ where: { id: postId } });
  return { success: true };
});
```

## 🎯 Best Practices

### ✅ Do's

- Always validate authentication on the server side
- Use type-safe session objects
- Implement proper error handling
- Validate all user inputs
- Use role-based access control for sensitive operations
- Log important security events
- Use transactions for multi-step operations
- Implement rate limiting for API routes

### ❌ Don'ts

- Never trust client-side authentication alone
- Don't expose sensitive data in error messages
- Don't store sensitive data in session storage or local storage
- Don't skip input validation
- Don't hard-code user IDs or roles
- Avoid checking authentication in middleware for API performance

## 🔍 Debugging Tips

### Check Session Status

```typescript
// Client-side
const { data: session } = useSession();
console.log("Session:", session);

// Server-side
const session = await getServerSession();
console.log("Server session:", session);
```

### Verify Role and Plan

```typescript
const session = await getServerSession();
console.log("User role:", session?.user.role);
console.log("User plan:", (session?.user as any).accessTier);
```

### Test API Routes

```bash
# Test public endpoint
curl http://localhost:3000/api/public/endpoint

# Test protected endpoint (with auth)
curl -H "Cookie: better-auth.session=YOUR_SESSION_TOKEN" \
  http://localhost:3000/api/protected/endpoint
```

## 🌐 Environment Variables

Required environment variables for authentication:

```env
# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

## 📖 Additional Resources

### Better Auth Documentation
- Official Docs: https://better-auth.com
- GitHub: https://github.com/better-auth/better-auth

### Next.js Documentation
- Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware

### Prisma Documentation
- Docs: https://www.prisma.io/docs
- Client API: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference

## 🆘 Getting Help

If you encounter issues:

1. Check the relevant documentation section
2. Review the error messages carefully
3. Verify your environment variables are set correctly
4. Check the Better Auth documentation for framework-specific issues
5. Review the example code in this documentation

## 📝 Contributing

When adding new features that involve authentication:

1. Update the relevant documentation file
2. Add examples demonstrating the feature
3. Update this README if adding new major functionality
4. Test all authentication flows
5. Ensure backward compatibility

## 📄 License

This documentation is part of the project and follows the same license.

---

**Last Updated:** 2025-10-10

**Documentation Version:** 1.0.0

For questions or improvements, please contact the development team.