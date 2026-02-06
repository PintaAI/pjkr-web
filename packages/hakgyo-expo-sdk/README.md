# hakgyo-expo-sdk

[![npm version](https://badge.fury.io/js/hakgyo-expo-sdk.svg)](https://www.npmjs.com/package/hakgyo-expo-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TypeScript SDK for integrating hakgyo webapp authentication and API in Expo/React Native applications.

## Features

- **Better-Auth Integration** - Seamless authentication with Expo plugin support
- **Secure Storage** - Uses `expo-secure-store` for secure session management
- **Auto Session Refresh** - Automatic token refresh before expiry
- **Retry Logic** - Built-in retry mechanism with exponential backoff
- **Full TypeScript Support** - Complete type definitions for all API responses
- **React Hooks** - Authentication hooks for easy state management
- **Configurable** - Customize timeouts, retries, logging, and more
- **Structured Error Handling** - Dedicated error classes for different scenarios
- **Pagination Support** - Standardized query parameters for paginated responses

## Installation

```bash
bun add hakgyo-expo-sdk
# or
npm install hakgyo-expo-sdk
# or
yarn add hakgyo-expo-sdk
```

### Peer Dependencies

This SDK requires the following peer dependencies:

```bash
expo>=50.0.0
react>=18.0.0
react-native>=0.73.0
expo-secure-store>=12.0.0
```

## Quick Start

### 1. Initialize the SDK

Initialize the SDK in your app entry point (e.g., `App.tsx` or `app/_layout.tsx`):

```typescript
import { initSDK } from 'hakgyo-expo-sdk';

initSDK({
  baseURL: 'https://your-hakgyo-api.com',
  // Optional: override default config
  auth: {
    storagePrefix: 'hakgyo_auth',
    sessionRefreshThreshold: 5, // minutes
    autoRefresh: true,
    deepLinkScheme: 'hakgyo://',
  },
  api: {
    timeout: 30000, // ms
    retries: 3,
    retryDelay: 1000, // ms
  },
  logging: {
    enabled: false,
    level: 'error', // 'debug' | 'info' | 'warn' | 'error'
  },
  platform: {
    deviceId: 'your-device-id',
    platformType: 'ios', // 'ios' | 'android' | 'web'
  },
});
```

### 2. Wrap Your App with AuthProvider

```typescript
import { AuthProvider } from 'hakgyo-expo-sdk';

export default function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}
```

### 3. Use Authentication

```typescript
import { useAuth } from 'hakgyo-expo-sdk';

function LoginScreen() {
  const { signIn, signUp, signOut, isLoading, user } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn('user@example.com', 'password');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSignUp = async () => {
    try {
      await signUp('user@example.com', 'password', 'John Doe');
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };

  return (
    // Your login UI
  );
}
```

### 4. Make API Calls

```typescript
import { kelasApi, materiApi, vocabularyApi } from 'hakgyo-expo-sdk';

// Fetch kelas list
const kelasList = await kelasApi.list();

// Get specific materi
const materi = await materiApi.get('materi-id');

// Get daily vocabulary
const dailyVocab = await vocabularyApi.getDaily();
```

## Configuration

### HakgyoSDKConfig

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `baseURL` | `string` | Yes | - | Base URL of the Hakgyo API |
| `auth.storagePrefix` | `string` | No | `'hakgyo_auth'` | Prefix for secure storage keys |
| `auth.sessionRefreshThreshold` | `number` | No | `5` | Minutes before expiry to refresh session |
| `auth.autoRefresh` | `boolean` | No | `true` | Enable automatic session refresh |
| `auth.deepLinkScheme` | `string` | No | `'hakgyo://'` | Deep link scheme for auth callbacks |
| `api.timeout` | `number` | No | `30000` | Request timeout in milliseconds |
| `api.retries` | `number` | No | `3` | Number of retry attempts for failed requests |
| `api.retryDelay` | `number` | No | `1000` | Initial delay between retries in milliseconds |
| `logging.enabled` | `boolean` | No | `false` | Enable debug logging |
| `logging.level` | `'debug'\|'info'\|'warn'\|'error'` | No | `'error'` | Minimum log level to output |
| `platform.deviceId` | `string` | No | - | Unique device identifier |
| `platform.platformType` | `'ios'\|'android'\|'web'` | No | - | Platform type |

### Getting Current Config

```typescript
import { getConfig } from 'hakgyo-expo-sdk';

const currentConfig = getConfig();
```

## Authentication

### Auth Functions

#### Sign In with Email

```typescript
import { signInWithEmail } from 'hakgyo-expo-sdk';

const session = await signInWithEmail('user@example.com', 'password');
```

#### Sign Up with Email

```typescript
import { signUpWithEmail } from 'hakgyo-expo-sdk';

const session = await signUpWithEmail('user@example.com', 'password', 'John Doe');
```

#### Sign In with Google

```typescript
import { signInWithGoogle } from 'hakgyo-expo-sdk';

const session = await signInWithGoogle(googleIdToken);
```

#### Sign Out

```typescript
import { signOut } from 'hakgyo-expo-sdk';

await signOut();
```

### React Hooks

#### useAuth

Access authentication state and methods:

```typescript
import { useAuth } from 'hakgyo-expo-sdk';

function MyComponent() {
  const {
    user,           // Current user object
    session,        // Current session object
    isLoading,      // Loading state
    isAuthenticated,// Boolean indicating auth status
    signIn,         // Sign in function
    signUp,         // Sign up function
    signOut,        // Sign out function
  } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated) return <LoginScreen />;

  return <Dashboard user={user} />;
}
```

#### useSession

Convenience hook for session/user data:

```typescript
import { useSession } from 'hakgyo-expo-sdk';

function UserProfile() {
  const { user, session } = useSession();

  return (
    <View>
      <Text>Welcome, {user?.name}</Text>
    </View>
  );
}
```

### Session Management

```typescript
import { SessionManager } from 'hakgyo-expo-sdk';

// Store session
await SessionManager.setSession(session);

// Get current session (auto-checks expiry and refreshes if needed)
const session = await SessionManager.getSession();

// Clear session
await SessionManager.clearSession();

// Manually refresh session
const refreshedSession = await SessionManager.refreshSession();
```

## API Usage

### ApiClient

The SDK provides a generic HTTP client with built-in authentication:

```typescript
import { ApiClient } from 'hakgyo-expo-sdk';

const client = new ApiClient();

// GET request
const data = await client.get<T>('/path', { param1: 'value' });

// POST request
const result = await client.post<T>('/path', { key: 'value' });

// PUT request
const updated = await client.put<T>('/path', { key: 'value' });

// PATCH request
const patched = await client.patch<T>('/path', { key: 'value' });

// DELETE request
await client.delete('/path');

// Generic request
const response = await client.request<T>(
  'GET',
  '/path',
  { body: {} },
  { 'X-Custom-Header': 'value' }
);
```

### Kelas API

```typescript
import { kelasApi } from 'hakgyo-expo-sdk';

// List all kelas
const kelasList = await kelasApi.list();

// Get specific kelas
const kelas = await kelasApi.get('kelas-id');

// Create new kelas
const newKelas = await kelasApi.create({
  title: 'Korean 101',
  description: 'Beginner Korean course',
  type: 'COURSE',
  level: 'BEGINNER',
  pricing: { amount: 0, currency: 'IDR' },
});

// Update kelas
const updated = await kelasApi.update('kelas-id', { title: 'Updated Title' });

// Delete kelas
await kelasApi.delete('kelas-id');

// Join a kelas
await kelasApi.join('kelas-id');

// Leave a kelas
await kelasApi.leave('kelas-id');

// Get materials for a kelas
const materials = await kelasApi.getMaterials('kelas-id');
```

### Materi API

```typescript
import { materiApi } from 'hakgyo-expo-sdk';

// Get materi
const materi = await materiApi.get('materi-id');

// Mark materi as complete
await materiApi.complete('materi-id');

// Submit assessment
const result = await materiApi.submitAssessment('materi-id', {
  answers: [{ questionId: 'q1', answer: 'A' }],
});

// Get assessment config
const config = await materiApi.getAssessmentConfig('materi-id');
```

### Vocabulary API

```typescript
import { vocabularyApi } from 'hakgyo-expo-sdk';

// Get daily vocabulary
const daily = await vocabularyApi.getDaily();

// Get vocabulary set
const set = await vocabularyApi.getSet('set-id');

// List vocabulary sets
const sets = await vocabularyApi.listSets();

// Create vocabulary set
const newSet = await vocabularyApi.createSet({
  title: 'Basic Greetings',
  icon: '👋',
  isPublic: true,
});

// List items in a set
const items = await vocabularyApi.listItems('set-id');

// Get specific item
const item = await vocabularyApi.getItem('item-id');

// Add item to set
const newItem = await vocabularyApi.addItem('set-id', {
  korean: '안녕하세요',
  indonesian: 'Halo',
  type: 'WORD',
  pos: 'NOUN',
  audioUrl: 'https://...',
});

// Update item
const updated = await vocabularyApi.updateItem('item-id', {
  indonesian: 'Halo semuanya',
});

// Delete item
await vocabularyApi.deleteItem('item-id');

// Mark item as learned
await vocabularyApi.markLearned('item-id');
```

### Soal API

```typescript
import { soalApi } from 'hakgyo-expo-sdk';

// Get question collection
const collection = await soalApi.getCollection('collection-id');

// List collections
const collections = await soalApi.listCollections();

// Create collection
const newCollection = await soalApi.createCollection({
  title: 'Grammar Practice',
  description: 'Basic grammar exercises',
  difficulty: 'EASY',
});

// Start practice session
const session = await soalApi.practice('collection-id');

// Submit practice answers
const result = await soalApi.submitPractice('session-id', {
  answers: [{ questionId: 'q1', answer: 'A' }],
});
```

### Tryout API

```typescript
import { tryoutApi } from 'hakgyo-expo-sdk';

// Get tryout
const tryout = await tryoutApi.get('tryout-id');

// List active tryouts
const active = await tryoutApi.listActive();

// Participate in tryout
const participation = await tryoutApi.participate('tryout-id');

// Submit tryout answers
const result = await tryoutApi.submit('tryout-id', {
  answers: [{ questionId: 'q1', answer: 'A' }],
});

// Get tryout results
const results = await tryoutApi.getResults('tryout-id');
```

### Posts API

```typescript
import { postsApi } from 'hakgyo-expo-sdk';

// List posts
const posts = await postsApi.list();

// Get post
const post = await postsApi.get('post-id');

// Create post
const newPost = await postsApi.create({
  title: 'My First Post',
  content: 'Hello everyone!',
});

// Update post
const updated = await postsApi.update('post-id', { title: 'Updated' });

// Delete post
await postsApi.delete('post-id');

// Like post
await postsApi.like('post-id');

// Unlike post
await postsApi.unlike('post-id');

// Get comments
const comments = await postsApi.getComments('post-id');

// Add comment
const comment = await postsApi.addComment('post-id', {
  content: 'Great post!',
});
```

### User API

```typescript
import { userApi } from 'hakgyo-expo-sdk';

// Get profile
const profile = await userApi.getProfile();

// Update profile
const updated = await userApi.updateProfile({
  name: 'John Doe',
  bio: 'Learning Korean!',
});

// Get user's classes
const classes = await userApi.getClasses();

// Get tryout results
const results = await userApi.getTryoutResults();

// Register push token
await userApi.registerPushToken('push-token');
```

### Notifications API

```typescript
import { notificationsApi } from 'hakgyo-expo-sdk';

// Register push notification token
await notificationsApi.registerToken('push-token');

// Unregister push notification token
await notificationsApi.unregisterToken('push-token');
```

## Type Definitions

### Auth Types

```typescript
// User roles
type UserRole = 'MURID' | 'GURU' | 'ADMIN';

// User tiers
type UserTier = 'FREE' | 'PREMIUM' | 'CUSTOM';

// User object
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tier: UserTier;
  createdAt: Date;
  updatedAt: Date;
}

// Session object
interface Session {
  user: User;
  token: string;
  expiresAt: Date;
  refreshToken?: string;
}

// Sign in response
interface SignInResponse {
  user: User;
  session: Session;
}

// Sign up response
interface SignUpResponse {
  user: User;
  session: Session;
}

// Sign out response
interface SignOutResponse {
  success: boolean;
}
```

### Model Types

#### Kelas

```typescript
interface Kelas {
  id: string;
  title: string;
  description?: string;
  type: 'COURSE' | 'WORKSHOP' | 'WEBINAR';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  pricing: {
    amount: number;
    currency: string;
  };
  author: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### Materi

```typescript
interface Materi {
  id: string;
  kelasId: string;
  title: string;
  content: string;
  order: number;
  isDemo: boolean;
  assessmentConfig?: {
    enabled: boolean;
    passScore: number;
    timeLimit?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### Vocabulary

```typescript
interface VocabularySet {
  id: string;
  title: string;
  icon?: string;
  isPublic: boolean;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface VocabularyItem {
  id: string;
  setId: string;
  korean: string;
  indonesian: string;
  type: 'WORD' | 'SENTENCE';
  pos?: string; // Part of speech
  audioUrl?: string;
  isLearned: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Soal

```typescript
interface Soal {
  id: string;
  question: string;
  options: Opsi[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

interface Opsi {
  id: string;
  label: string;
  value: string;
}

interface KoleksiSoal {
  id: string;
  title: string;
  description?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionCount: number;
  createdAt: Date;
}

interface PracticeSession {
  id: string;
  collectionId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
}

interface PracticeResult {
  sessionId: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  answers: Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
  }>;
}
```

#### Tryout

```typescript
interface Tryout {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  questionCount: number;
  isActive: boolean;
  createdAt: Date;
}

interface TryoutParticipant {
  id: string;
  tryoutId: string;
  userId: string;
  joinedAt: Date;
  submittedAt?: Date;
}

interface TryoutResult {
  id: string;
  participantId: string;
  score: number;
  rank?: number;
  answers: Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
  }>;
}
```

#### Posts

```typescript
interface Post {
  id: string;
  authorId: string;
  title: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

The SDK provides structured error classes for different error scenarios:

### Error Classes

```typescript
// Base error class
class HakgyoError extends Error {
  code: string;
  constructor(message: string, code: string);
}

// Authentication errors
class AuthError extends HakgyoError {
  constructor(message: string, code: string);
}

// API errors with status code and response data
class ApiError extends HakgyoError {
  statusCode: number;
  response?: any;
  constructor(message: string, statusCode: number, response?: any);
}

// Network-related errors
class NetworkError extends HakgyoError {
  constructor(message: string, code: string);
}
```

### Error Handling Example

```typescript
import { AuthError, ApiError, NetworkError } from 'hakgyo-expo-sdk';

try {
  await kelasApi.list();
} catch (error) {
  if (error instanceof AuthError) {
    // Handle authentication errors
    console.error('Authentication failed:', error.message);
    // Redirect to login
  } else if (error instanceof ApiError) {
    // Handle API errors
    console.error(`API error (${error.statusCode}):`, error.message);
    if (error.statusCode === 404) {
      // Resource not found
    } else if (error.statusCode >= 500) {
      // Server error
    }
  } else if (error instanceof NetworkError) {
    // Handle network errors
    console.error('Network error:', error.message);
    // Show offline message
  } else {
    // Unknown error
    console.error('Unknown error:', error);
  }
}
```

## Advanced Usage

### Custom API Client

```typescript
import { ApiClient } from 'hakgyo-expo-sdk';

const customClient = new ApiClient();

// Make custom requests
const data = await customClient.get<MyResponseType>('/custom-endpoint', {
  page: 1,
  limit: 20,
});
```

### Direct Auth Client Access

```typescript
import { getAuthClient } from 'hakgyo-expo-sdk';

const authClient = getAuthClient();

// Access underlying better-auth client
const session = await authClient.getSession();
```

### Config Validation

```typescript
import { validateConfig } from 'hakgyo-expo-sdk';

const config = {
  baseURL: 'https://api.example.com',
  // ... other config
};

const { valid, errors } = validateConfig(config);

if (!valid) {
  console.error('Invalid config:', errors);
}
```

## API Endpoints Reference

| Module | Endpoint | Method | Description |
|--------|----------|--------|-------------|
| Auth | `/api/auth/sign-up` | POST | Register new user |
| Auth | `/api/auth/sign-in` | POST | Sign in user |
| Auth | `/api/auth/sign-out` | POST | Sign out user |
| Auth | `/api/auth/session` | GET | Get current session |
| Kelas | `/api/kelas` | GET | List all kelas |
| Kelas | `/api/kelas` | POST | Create new kelas |
| Kelas | `/api/kelas/[id]` | GET | Get specific kelas |
| Kelas | `/api/kelas/[id]` | PUT | Update kelas |
| Kelas | `/api/kelas/[id]` | DELETE | Delete kelas |
| Kelas | `/api/kelas/[id]/join` | POST | Join a kelas |
| Kelas | `/api/kelas/[id]/leave` | POST | Leave a kelas |
| Kelas | `/api/kelas/[id]/materials` | GET | Get kelas materials |
| Materi | `/api/materi/[id]` | GET | Get materi |
| Materi | `/api/materi/[id]/complete` | POST | Mark as complete |
| Materi | `/api/materi/[id]/assessment` | POST | Submit assessment |
| Materi | `/api/materi/[id]/assessment-config` | GET | Get assessment config |
| Vocabulary | `/api/vocabulary/daily` | GET | Get daily vocabulary |
| Vocabulary | `/api/vocabulary-sets` | GET | List vocabulary sets |
| Vocabulary | `/api/vocabulary-sets` | POST | Create vocabulary set |
| Vocabulary | `/api/vocabulary-sets/[id]` | GET | Get vocabulary set |
| Vocabulary | `/api/vocabulary-sets/[id]` | PUT | Update vocabulary set |
| Vocabulary | `/api/vocabulary-sets/[id]` | DELETE | Delete vocabulary set |
| Vocabulary | `/api/vocabulary-items` | GET | List vocabulary items |
| Vocabulary | `/api/vocabulary-items` | POST | Create vocabulary item |
| Vocabulary | `/api/vocabulary-items/[id]` | GET | Get vocabulary item |
| Vocabulary | `/api/vocabulary-items/[id]` | PUT | Update vocabulary item |
| Vocabulary | `/api/vocabulary-items/[id]` | DELETE | Delete vocabulary item |
| Vocabulary | `/api/vocabulary-items/[id]/mark-learned` | POST | Mark as learned |
| Soal | `/api/soal-collections` | GET | List question collections |
| Soal | `/api/soal-collections` | POST | Create collection |
| Soal | `/api/soal-collections/[id]` | GET | Get collection |
| Soal | `/api/soal/practice` | POST | Start practice session |
| Soal | `/api/soal/practice/[id]/submit` | POST | Submit practice |
| Tryout | `/api/tryout` | GET | List tryouts |
| Tryout | `/api/tryout/active` | GET | List active tryouts |
| Tryout | `/api/tryout/[id]` | GET | Get tryout |
| Tryout | `/api/tryout/[id]/participate` | POST | Participate in tryout |
| Tryout | `/api/tryout/[id]/submit` | POST | Submit tryout |
| Tryout | `/api/tryout/[id]/results` | GET | Get tryout results |
| Posts | `/api/posts` | GET | List posts |
| Posts | `/api/posts` | POST | Create post |
| Posts | `/api/posts/[id]` | GET | Get post |
| Posts | `/api/posts/[id]` | PUT | Update post |
| Posts | `/api/posts/[id]` | DELETE | Delete post |
| Posts | `/api/posts/[id]/like` | POST | Like post |
| Posts | `/api/posts/[id]/unlike` | POST | Unlike post |
| Posts | `/api/posts/[id]/comments` | GET | Get comments |
| Posts | `/api/posts/[id]/comments` | POST | Add comment |
| User | `/api/users/me` | GET | Get profile |
| User | `/api/users/me` | PUT | Update profile |
| User | `/api/users/me/kelas` | GET | Get user's classes |
| User | `/api/users/me/tryout-results` | GET | Get tryout results |
| User | `/api/users/me/push-token` | POST | Register push token |
| Push | `/api/push-tokens/register` | POST | Register push token |
| Push | `/api/push-tokens/[id]` | DELETE | Unregister push token |

## License

MIT © [Your Name]

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/yourusername/hakgyo-expo-sdk).
