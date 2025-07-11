# Session Management Documentation

This document explains the session management system for the PJKR application, covering architecture, usage patterns, and best practices.

## Architecture Overview

### 🏗️ **Core Components**

#### 1. Better Auth Integration
- **Auth Client**: `lib/auth-client.ts` - Configures Better Auth with Google OAuth
- **Session Hook**: `lib/hooks/use-session.ts` - Enhanced session utilities with role-based access
- **Middleware**: `middleware.ts` - Route protection and authentication checks

#### 2. Performance Optimized Design
- ✅ **No Context Provider**: Direct hook usage prevents unnecessary re-renders
- ✅ **Memoized Returns**: All hooks use `useMemo()` for optimal performance
- ✅ **Individual State Management**: Each component manages its own session state

## Session Hook Usage

### 🎯 **Primary Hook: `useSession()`**

```typescript
import { useSession } from "@/lib/hooks/use-session"

function MyComponent() {
  const { session, user, isAuthenticated, isLoading, error } = useSession()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please login</div>
  
  return <div>Welcome, {user?.name}!</div>
}
```

#### Return Properties
- `session` - Raw Better Auth session object
- `user` - Enhanced user object with role/plan/stats
- `isAuthenticated` - Boolean authentication status
- `isLoading` - Loading state during session check
- `error` - Any authentication errors

### 🔐 **Role-Based Hooks**

#### `useRole(requiredRole)`
```typescript
import { useRole } from "@/lib/hooks/use-session"

function AdminPanel() {
  const { hasRole, isLoading, userRole } = useRole("ADMIN")
  
  if (!hasRole) return <div>Access denied</div>
  return <div>Admin content</div>
}
```

#### `usePlan(requiredPlan)`
```typescript
import { usePlan } from "@/lib/hooks/use-session"

function PremiumFeature() {
  const { hasPlan } = usePlan("PREMIUM")
  
  if (!hasPlan) return <div>Upgrade to premium</div>
  return <div>Premium content</div>
}
```

#### `usePermissions()`
```typescript
import { usePermissions } from "@/lib/hooks/use-session"

function Dashboard() {
  const { 
    canCreateCourse, 
    canManageUsers, 
    canAccessPremium,
    isGuru,
    isAdmin,
    isMurid 
  } = usePermissions()
  
  return (
    <div>
      {canCreateCourse && <CreateCourseButton />}
      {canManageUsers && <UserManagement />}
      {canAccessPremium && <PremiumContent />}
    </div>
  )
}
```

## User Roles & Plans

### 👥 **User Roles**
- **`MURID`** - Student (default role)
- **`GURU`** - Teacher/Instructor
- **`ADMIN`** - Administrator

### 💳 **User Plans**
- **`FREE`** - Basic access (default)
- **`PREMIUM`** - Enhanced features
- **`CUSTOM`** - Enterprise/custom features

### 🔑 **Permission Matrix**

| Permission | MURID | GURU | ADMIN |
|------------|--------|------|-------|
| `canCreateCourse` | ❌ | ✅ | ✅ |
| `canManageUsers` | ❌ | ❌ | ✅ |
| `canAccessPremium` | Plan-based | Plan-based | ✅ |

## Authentication Flow

### 🚀 **Sign In Methods**

#### Google OAuth
```typescript
import { signInWithGoogle } from "@/lib/auth-client"

const handleGoogleSignIn = async () => {
  const result = await signInWithGoogle()
  if (result.error) {
    // Handle error
  } else {
    // Redirect to dashboard
  }
}
```

#### Email/Password
```typescript
import { signInWithEmailPassword } from "@/lib/auth-client"

const handleLogin = async (email: string, password: string) => {
  const result = await signInWithEmailPassword(email, password)
  // Handle result
}
```

#### Registration
```typescript
import { signUpWithEmailPassword } from "@/lib/auth-client"

const handleRegister = async (email: string, password: string, name: string) => {
  const result = await signUpWithEmailPassword(email, password, name)
  // Handle result
}
```

### 🚪 **Sign Out**
```typescript
import { signOut } from "@/lib/auth-client"

const handleSignOut = async () => {
  await signOut()
  router.push("/")
}
```

## Route Protection

### 🛡️ **Middleware Protection**

Routes are automatically protected based on configuration in `lib/routes.ts`:

#### Route Categories
- **Public Routes**: `/`, `/about`, `/contact`, `/pricing`, `/features` - No authentication required
- **Auth Routes**: `/auth`, `/auth/reset-password`, `/auth/verify-email` - Redirect if already authenticated
- **Protected Routes**: `/home`, `/dashboard`, `/profile`, `/settings`, `/kelas`, `/vocabulary`, `/soal`, `/game` - Require authentication

**Note**: There are no dedicated `/admin/*` or `/guru/*` routes. Role-based access is handled at the component level:
- **`/dashboard`** - Accessible to GURU and ADMIN users
- **MURID users** accessing `/dashboard` are redirected to `/home` (handled in `layout-wrapper.tsx`)

#### Automatic Redirects
- Unauthenticated users → `/auth`
- Authenticated users visiting auth pages → `/home`
- MURID users accessing `/dashboard` → `/home` (component-level redirect)
- GURU/ADMIN users login → `/dashboard`

### 🎯 **Component-Level Protection**

#### Using `useRequireAuth()`
```typescript
import { useRequireAuth } from "@/lib/hooks/use-session"

function ProtectedComponent() {
  const { session, isLoading } = useRequireAuth() // Throws error if not authenticated
  
  if (isLoading) return <div>Loading...</div>
  return <div>Protected content</div>
}
```

## Performance Considerations

### ⚡ **Why No Context Provider?**

**Before (Context-based):**
```typescript
// ❌ Causes ALL children to re-render on session change
<SessionProvider>
  <App />
</SessionProvider>
```

**After (Direct hooks):**
```typescript
// ✅ Only specific components re-render
function Component() {
  const session = useSession() // Independent state
}
```

### 🚀 **Optimization Features**

#### Memoization
- All hook returns are memoized with `useMemo()`
- Prevents unnecessary re-renders when session data unchanged
- Computed values (permissions, roles) cached until dependencies change

#### Individual State Management
- Each component calling `useSession()` gets its own state
- No cascading re-renders through context tree
- Better tree-shaking and code splitting

## Error Handling

### 🔍 **Error Patterns**

#### Session Errors
```typescript
const { error } = useSession()

if (error) {
  // Handle authentication errors
  console.error("Session error:", error)
}
```

#### Authentication Requirements
```typescript
try {
  const { session } = useRequireAuth()
} catch (error) {
  // User not authenticated
  router.push("/auth")
}
```

## Best Practices

### ✅ **Do's**

1. **Use appropriate hooks for your use case**
   ```typescript
   // ✅ Good: Specific permission check
   const { canCreateCourse } = usePermissions()
   
   // ❌ Avoid: Full session when only checking permission
   const { session } = useSession()
   const canCreate = session?.user?.role === "GURU"
   ```

2. **Handle loading states**
   ```typescript
   const { user, isLoading } = useSession()
   
   if (isLoading) return <Skeleton />
   if (!user) return <LoginPrompt />
   ```

3. **Use `getPermissions()` for non-hook contexts**
   ```typescript
   // In utility functions, outside components
   import { getPermissions } from "@/lib/hooks/use-session"
   
   function checkUserAccess(user) {
     const { canManageUsers } = getPermissions(user)
     return canManageUsers
   }
   ```

### ❌ **Don'ts**

1. **Don't create custom context providers for session**
   ```typescript
   // ❌ Unnecessary - just use useSession() directly
   const SessionContext = createContext()
   ```

2. **Don't call hooks conditionally**
   ```typescript
   // ❌ Bad
   if (someCondition) {
     const session = useSession()
   }
   
   // ✅ Good
   const session = useSession()
   if (someCondition && session.user) {
     // Use session
   }
   ```

3. **Don't forget error boundaries for auth errors**
   ```typescript
   // ✅ Wrap auth components in error boundaries
   <ErrorBoundary fallback={<AuthError />}>
     <AuthenticatedComponent />
   </ErrorBoundary>
   ```

## Development vs Production

### 🔧 **Development Behavior**
- APIs may hit twice due to React Strict Mode (normal behavior)
- Better Auth handles session persistence automatically
- Hot reload preserves authentication state

### 🚀 **Production Optimizations**
- Single API calls (no Strict Mode double-calling)
- Session cookie-based authentication
- Middleware-level route protection for performance

## Troubleshooting

### 🐛 **Common Issues**

#### "useSession must be used within SessionProvider"
- **Solution**: This error shouldn't occur anymore since we removed the provider
- Use `useSession()` directly in any component

#### Session not persisting across page refreshes
- **Check**: Better Auth configuration in `lib/auth-client.ts`
- **Verify**: `BETTER_AUTH_SECRET` and `NEXT_PUBLIC_BETTER_AUTH_URL` environment variables

#### Role-based redirects not working
- **Check**: Middleware configuration in `middleware.ts`
- **Verify**: Route patterns in `lib/routes.ts`
- **Debug**: Add console logs in middleware for session cookie detection

#### Performance issues with session checks
- **Solution**: Use specific hooks (`useRole`, `usePlan`) instead of full `useSession`
- **Check**: Ensure memoization is working (no unnecessary re-renders)

## Migration Notes

### 📦 **From Context-based to Direct Hooks**

If migrating from the old context-based system:

1. **Remove SessionProvider import and wrapper**
2. **Replace `useSessionContext()` with `useSession()`**
3. **Update imports to point to `@/lib/hooks/use-session`**

```typescript
// Before
import { useSessionContext } from "@/components/session-provider"
const session = useSessionContext()

// After
import { useSession } from "@/lib/hooks/use-session"
const session = useSession()
```

## Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Next.js Middleware Guide](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [React Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
