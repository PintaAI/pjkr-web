# Hakgyo Expo SDK Overview

The `hakgyo-expo-sdk` is a TypeScript SDK designed to simplify the integration of Hakgyo's backend services into Expo and React Native applications. It provides a unified interface for authentication, API communication, and state management.

## Installation

```bash
npm install hakgyo-expo-sdk
# or
yarn add hakgyo-expo-sdk
```

## Initialization

Before using any SDK features, you must initialize it with your backend configuration, typically in your app's entry point (e.g., `App.tsx` or `app/_layout.tsx`).

```typescript
import { initSDK } from 'hakgyo-expo-sdk';

initSDK({
  baseURL: 'https://api.your-hakgyo-instance.com', // Required
  auth: {
    deepLinkScheme: 'hakgyo', // For deep linking (OAuth)
    storagePrefix: 'hakgyo_auth', // Optional: prefix for SecureStore keys
  },
  logging: {
    enabled: true,
    level: 'debug', // 'debug' | 'info' | 'warn' | 'error'
  },
});
```

## Authentication

The SDK provides a comprehensive authentication system built on top of `better-auth`, optimized for Expo.

### Provider Setup

Wrap your application with the `AuthProvider` to enable session management hooks.

```tsx
import { AuthProvider } from 'hakgyo-expo-sdk';

export default function App() {
  return (
    <AuthProvider>
      <Slot /> {/* Your app navigation */}
    </AuthProvider>
  );
}
```

### Using Authentication Hooks

Use the `useAuth` or `useSession` hooks to access the current user state and authentication methods.

```tsx
import { useAuth } from 'hakgyo-expo-sdk';

function LoginScreen() {
  const { signInWithEmail, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const result = await signInWithEmail(email, password);
      if (result.success) {
        // Navigate to home
      } else {
        alert(result.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    // ... UI components
  );
}
```

**Available Auth Methods:**
*   `signInWithEmail(email, password)`
*   `signUpWithEmail(email, password, name)`
*   `signInWithGoogle(idToken)`
*   `signOut()`
*   `refreshSession()`

## API Client

The SDK includes a typed API client that automatically handles:
*   Authentication headers/cookies
*   Request retries (for network stability)
*   Timeouts
*   Error normalization

### Usage

You can use the specialized API modules directly.

#### User & Profile
```typescript
import { userApi } from 'hakgyo-expo-sdk';

// Get current user profile
const response = await userApi.getProfile();
if (response.success) {
  console.log('User:', response.data);
}

// Get enrolled classes
const classes = await userApi.getClasses('user-uuid');
```

#### Classes (Kelas)
```typescript
import { kelasApi } from 'hakgyo-expo-sdk';

// List available classes
const result = await kelasApi.list({ page: 1, limit: 10 });

// Join a class
await kelasApi.join(classId);

// Get class materials
const materials = await kelasApi.getMaterials(classId);
```

### Supported API Modules
The SDK exports the following API modules:
*   `userApi`: User profile and data.
*   `kelasApi`: Class management and enrollment.
*   `materiApi`: Learning materials and completion tracking.
*   `vocabularyApi`: Vocabulary sets and daily words.
*   `soalApi`: Practice questions management.
*   `tryoutApi`: Exam simulation and results.
*   `postsApi`: Community posts and discussions.

## Error Handling

All SDK errors are typed for easier handling.

```typescript
import { AuthError, NetworkError, ApiError } from 'hakgyo-expo-sdk';

try {
  await kelasApi.join(123);
} catch (error) {
  if (error instanceof NetworkError) {
    // Handle offline state
    alert("Please check your internet connection.");
  } else if (error instanceof ApiError) {
    // Handle API error (e.g., 404, 403)
    console.error(`API Error ${error.status}: ${error.message}`);
  } else if (error instanceof AuthError) {
    // Handle auth failures
    alert("Authentication failed.");
  }
}
```

## Configuration Reference

### `HakgyoSDKConfig`

| Property | Type | Description |
|----------|------|-------------|
| `baseURL` | `string` | **Required.** The root URL of the Hakgyo API. |
| `auth` | `object` | Auth-specific settings. |
| `auth.storagePrefix` | `string` | Prefix for keys in `SecureStore`. Default: `hakgyo_auth`. |
| `auth.deepLinkScheme` | `string` | Scheme for deep linking (e.g., for OAuth). Default: `hakgyo`. |
| `api` | `object` | API client settings. |
| `api.timeout` | `number` | Request timeout in ms. Default: 30000 (30s). |
| `api.retries` | `number` | Number of retry attempts for failed requests. Default: 3. |
| `logging` | `object` | Logging configuration. |
| `logging.enabled` | `boolean` | Enable internal SDK logs. |
