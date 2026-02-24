# Kelas SDK Usage Guide

This guide provides comprehensive documentation for using the Kelas (Class) API in the Hakgyo Expo SDK for React Native applications.

## Table of Contents

- [Overview](#overview)
- [Installation & Setup](#installation--setup)
- [API Methods](#api-methods)
- [Type Definitions](#type-definitions)
- [Common Use Cases](#common-use-cases)
- [Error Handling](#error-handling)
- [Sequential Learning Progress](#sequential-learning-progress)

---

## Overview

The Kelas SDK provides a TypeScript client for managing classes/courses in the Hakgyo platform. It handles:

- Class listing, retrieval, creation, update, and deletion
- User enrollment/unenrollment
- Sequential learning progress tracking
- Material accessibility control
- Question collection management

---

## Installation & Setup

### Installation

```bash
npm install @hakgyo-expo-sdk
```

### Basic Setup

```typescript
import { HakgyoSDK } from '@hakgyo-expo-sdk';

const sdk = new HakgyoSDK({
  baseURL: 'https://your-api.com',
  auth: {
    // Auth configuration
  }
});
```

### Accessing the Kelas API

```typescript
import { kelasApi } from '@hakgyo-expo-sdk';

// Now you can use all kelasApi methods
```

---

## API Methods

### `kelasApi.list(params?)`

Get list of classes with optional filtering and pagination.

**Parameters:**

```typescript
interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  type?: 'REGULAR' | 'EVENT' | 'GROUP' | 'PRIVATE' | 'FUN';
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  authorId?: string;
  authorEmail?: string;
}
```

**Returns:** `Promise<ApiResponse<PaginatedResponse<Kelas>>>`

**Example:**

```typescript
import { kelasApi } from '@hakgyo-expo-sdk';

// Get all beginner classes
const response = await kelasApi.list({
  level: 'BEGINNER',
  limit: 10,
  offset: 0
});

if (response.success) {
  const { data, pagination } = response.data;
  console.log(`Found ${pagination.total} classes`);
  
  data.forEach(kelas => {
    console.log(`- ${kelas.title} (${kelas.level})`);
  });
}
```

---

### `kelasApi.get(id)`

Get a specific class by ID.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `number` | Yes | Class ID |

**Returns:** `Promise<ApiResponse<Kelas>>`

**Example:**

```typescript
const response = await kelasApi.get(1);

if (response.success) {
  const kelas = response.data;
  console.log(`Class: ${kelas.title}`);
  console.log(`Author: ${kelas.author?.name}`);
  console.log(`Members: ${kelas._count?.members}`);
}
```

---

### `kelasApi.create(data)`

Create a new class.

**Parameters:**

```typescript
interface CreateKelasData {
  title: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  authorId: string;
  description?: string;
  jsonDescription?: any;
  htmlDescription?: string;
  type?: 'REGULAR' | 'EVENT' | 'GROUP' | 'PRIVATE' | 'FUN';
  thumbnail?: string;
  icon?: string;
  isPaidClass?: boolean;
  price?: number;
  discount?: number;
  promoCode?: string;
}
```

**Returns:** `Promise<ApiResponse<Kelas>>`

**Example:**

```typescript
const response = await kelasApi.create({
  title: 'Korean for Beginners',
  level: 'BEGINNER',
  authorId: 'user-123',
  description: 'Learn Korean from scratch',
  type: 'REGULAR',
  isPaidClass: false
});

if (response.success) {
  const newKelas = response.data;
  console.log(`Created class with ID: ${newKelas.id}`);
  console.log(`Created at: ${newKelas.createdAt}`);
}
```

---

### `kelasApi.update(id, data)`

Update an existing class.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `number` | Yes | Class ID |
| `data` | `Partial<Kelas>` | Yes | Updated class data |

**Returns:** `Promise<ApiResponse<Kelas>>`

**Example:**

```typescript
const response = await kelasApi.update(1, {
  title: 'Updated Title',
  description: 'Updated description',
  price: 50000
});

if (response.success) {
  const updatedKelas = response.data;
  console.log(`Class updated: ${updatedKelas.title}`);
}
```

---

### `kelasApi.delete(id)`

Delete a class.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `number` | Yes | Class ID |

**Returns:** `Promise<ApiResponse<void>>`

**Example:**

```typescript
const response = await kelasApi.delete(1);

if (response.success) {
  console.log('Class deleted successfully');
}
```

---

### `kelasApi.enroll(id, options?)`

Enroll in a class.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `number` | Yes | Class ID |
| `options` | `EnrollOptions` | No | Enrollment options |

```typescript
interface EnrollOptions {
  bypassPaymentCheck?: boolean;
}
```

**Returns:** `Promise<ApiResponse<{ success: boolean; enrolled: boolean; message?: string }>>`

**Enrollment Logic:**

| User Role | Class Type | Action |
|-----------|------------|--------|
| MURID | Free Class | Direct enrollment |
| MURID | Paid Class | Returns payment required error |
| GURU/ADMIN | Any Class | Direct enrollment |

**Example:**

```typescript
// Enroll in free class
const response = await kelasApi.enroll(1);

if (response.success) {
  console.log(response.data.message); // "Successfully enrolled in class"
}

// Enroll after payment (bypass check)
const response = await kelasApi.enroll(1, {
  bypassPaymentCheck: true
});

if (response.success) {
  console.log('Enrolled after payment');
}
```

---

### `kelasApi.unenroll(id)`

Unenroll from a class.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `number` | Yes | Class ID |

**Returns:** `Promise<ApiResponse<{ success: boolean; enrolled: boolean; message?: string }>>`

**Example:**

```typescript
const response = await kelasApi.unenroll(1);

if (response.success) {
  console.log(response.data.message); // "Successfully unenrolled from class"
}
```

---

### `kelasApi.getProgress(id)`

Get class progress with material accessibility. Requires user to be enrolled.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `number` | Yes | Class ID |

**Returns:** `Promise<ApiResponse<KelasProgressResponse>>`

**Example:**

```typescript
const response = await kelasApi.getProgress(1);

if (response.success) {
  const { materis, overallProgress } = response.data;
  
  console.log(`Progress: ${overallProgress.completionPercentage}%`);
  console.log(`Completed: ${overallProgress.completedCount}/${overallProgress.totalCount}`);
  
  materis.forEach(materi => {
    const status = materi.isAccessible ? 
      (materi.isCompleted ? '✓' : '○') : '🔒';
    console.log(`${materi.order}. ${materi.title} ${status}`);
  });
}
```

---

### `kelasApi.getSoalCollections(id)`

Get question collections linked to a class. GURU/ADMIN only.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `number` | Yes | Class ID |

**Returns:** `Promise<ApiResponse<any[]>>`

**Example:**

```typescript
const response = await kelasApi.getSoalCollections(1);

if (response.success) {
  const collections = response.data;
  console.log(`Found ${collections.length} collections`);
  
  collections.forEach(collection => {
    console.log(`- ${collection.nama} (${collection._count?.soals} questions)`);
  });
}
```

---

## User API

### `userApi.getClasses(userId)`

Get joined classes for a user.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | `string` | Yes | User ID |

**Returns:** `Promise<ApiResponse<Kelas[]>>`

**Example:**

```typescript
import { userApi } from '@hakgyo-expo-sdk';

const response = await userApi.getClasses('user-456');

if (response.success) {
  const kelasList = response.data;
  console.log(`User has joined ${kelasList.length} classes`);
  
  kelasList.forEach(kelas => {
    console.log(`- ${kelas.title}`);
  });
}
```

---

## Type Definitions

### Kelas

```typescript
interface Kelas {
  id: number;
  title: string;
  description?: string;
  jsonDescription?: any;
  htmlDescription?: string;
  type: 'REGULAR' | 'EVENT' | 'GROUP' | 'PRIVATE' | 'FUN';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  thumbnail?: string;
  icon?: string;
  isPaidClass: boolean;
  price?: string;
  discount?: string;
  promoCode?: string;
  isDraft: boolean;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}
```

### Materi

```typescript
interface Materi {
  id: number;
  title: string;
  description: string;
  jsonDescription: any;
  htmlDescription: string;
  order: number;
  isDemo: boolean;
  isDraft: boolean;
  koleksiSoalId?: number;
  passingScore?: number;
  kelasId: number;
  kelas?: Kelas;
  createdAt: string;
  updatedAt: string;
}
```

### KelasProgressMaterial

```typescript
interface KelasProgressMaterial {
  id: number;
  title: string;
  order: number;
  isAccessible: boolean;
  isCompleted: boolean;
  isFullyCompleted: boolean;
  hasAssessment: boolean;
  assessmentPassed: boolean;
  score: number | null;
  canRetake: boolean;
}
```

### KelasOverallProgress

```typescript
interface KelasOverallProgress {
  completedCount: number;
  totalCount: number;
  completionPercentage: number;
}
```

### KelasProgressResponse

```typescript
interface KelasProgressResponse {
  materis: KelasProgressMaterial[];
  overallProgress: KelasOverallProgress;
}
```

---

## Common Use Cases

### 1. Browse and Enroll in Classes

```typescript
import { kelasApi } from '@hakgyo-expo-sdk';

// List available classes
const response = await kelasApi.list({ level: 'BEGINNER' });

if (response.success) {
  const classes = response.data.data;
  
  // Display class list
  classes.map(kelas => (
    <ClassCard
      key={kelas.id}
      title={kelas.title}
      level={kelas.level}
      onPress={() => handleClassPress(kelas.id)}
    />
  ));
}

// Handle class press
const handleClassPress = async (kelasId: number) => {
  // Get class details
  const details = await kelasApi.get(kelasId);
  
  // Show class details modal
  showModal({
    title: details.data.title,
    description: details.data.description,
    onEnroll: () => handleEnroll(kelasId)
  });
};

// Enroll in class
const handleEnroll = async (kelasId: number) => {
  const response = await kelasApi.enroll(kelasId);
  
  if (response.success) {
    showSuccess('Enrolled successfully!');
    navigateToClass(kelasId);
  } else if (response.data?.requiresPayment) {
    // Redirect to payment
    navigateToPayment(response.data.paymentUrl);
  }
};
```

### 2. Track Learning Progress

```typescript
import { kelasApi } from '@hakgyo-expo-sdk';

// Get class progress
const response = await kelasApi.getProgress(1);

if (response.success) {
  const { materis, overallProgress } = response.data;
  
  // Display progress bar
  <ProgressBar 
    value={overallProgress.completionPercentage} 
    label={`${overallProgress.completedCount}/${overallProgress.totalCount} completed`}
  />
  
  // Show material list with access control
  <FlatList
    data={materis}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => (
      <MaterialCard
        title={item.title}
        order={item.order}
        accessible={item.isAccessible}
        completed={item.isCompleted}
        score={item.score}
        onPress={() => handleMaterialPress(item)}
      />
    )}
  />
}

const handleMaterialPress = (materi: KelasProgressMaterial) => {
  if (!materi.isAccessible) {
    showError('Complete previous material to unlock this one');
    return;
  }
  
  navigateToMaterial(materi.id);
};
```

### 3. Navigate Sequential Learning Path

```typescript
import { kelasApi } from '@hakgyo-expo-sdk';

// Get next accessible material
const getNextMaterial = async (kelasId: number) => {
  const response = await kelasApi.getProgress(kelasId);
  
  if (response.success) {
    const nextMaterial = response.data.materis.find(
      m => m.isAccessible && !m.isCompleted
    );
    
    return nextMaterial;
  }
  
  return null;
};

// Use in continue learning button
const handleContinueLearning = async () => {
  const nextMaterial = await getNextMaterial(kelasId);
  
  if (nextMaterial) {
    navigateToMaterial(nextMaterial.id);
  } else {
    showSuccess('You have completed all materials!');
  }
};
```

### 4. Manage User's Classes

```typescript
import { userApi } from '@hakgyo-expo-sdk';

// Get user's joined classes
const loadMyClasses = async () => {
  const response = await userApi.getClasses(userId);
  
  if (response.success) {
    const kelasList = response.data;
    
    // Display class list
    <FlatList
      data={kelasList}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <MyClassCard
          key={item.id}
          kelas={item}
          onPress={() => navigateToClass(item.id)}
        />
      )}
    />
  }
};

// With filtering
const loadFilteredClasses = async () => {
  const response = await userApi.getClasses(userId);
  
  if (response.success) {
    const beginnerClasses = response.data.filter(
      kelas => kelas.level === 'BEGINNER'
    );
    
    setClasses(beginnerClasses);
  }
};
```

### 5. Create and Manage Classes (GURU/ADMIN)

```typescript
import { kelasApi } from '@hakgyo-expo-sdk';

// Create new class
const createClass = async () => {
  const response = await kelasApi.create({
    title: title,
    level: level,
    description: description,
    type: 'REGULAR',
    isPaidClass: isPaid,
    price: isPaid ? price : undefined,
    authorId: userId
  });
  
  if (response.success) {
    showSuccess('Class created successfully!');
    navigateToClass(response.data.id);
  }
};

// Update class
const updateClass = async (kelasId: number) => {
  const response = await kelasApi.update(kelasId, {
    title: newTitle,
    description: newDescription
  });
  
  if (response.success) {
    showSuccess('Class updated successfully!');
    refreshClassDetails();
  }
};

// Delete class
const deleteClass = async (kelasId: number) => {
  const confirmed = await showConfirmDialog(
    'Are you sure you want to delete this class?'
  );
  
  if (confirmed) {
    const response = await kelasApi.delete(kelasId);
    
    if (response.success) {
      showSuccess('Class deleted successfully!');
      navigateBack();
    }
  }
};

// Get soal collections for class
const loadCollections = async (kelasId: number) => {
  const response = await kelasApi.getSoalCollections(kelasId);
  
  if (response.success) {
    setCollections(response.data);
  }
};
```

### 6. Handle Payment Flow

```typescript
import { kelasApi } from '@hakgyo-expo-sdk';

const handleEnroll = async (kelasId: number) => {
  try {
    const response = await kelasApi.enroll(kelasId);
    
    if (response.success) {
      showSuccess('Enrolled successfully!');
      navigateToClass(kelasId);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 402) {
        // Payment required
        const { price, discount, paymentUrl } = error.data;
        
        showPaymentModal({
          price,
          discount,
          finalPrice: price - (discount || 0),
          onConfirm: () => navigateToPayment(paymentUrl)
        });
      } else {
        showError(error.message);
      }
    }
  }
};

// After payment completion
const handlePaymentSuccess = async (kelasId: number) => {
  const response = await kelasApi.enroll(kelasId, {
    bypassPaymentCheck: true
  });
  
  if (response.success) {
    showSuccess('Enrolled successfully!');
    navigateToClass(kelasId);
  }
};
```

---

## Error Handling

### SDK Error Types

The SDK provides two main error types:

```typescript
import { ApiError, NetworkError } from '@hakgyo-expo-sdk';
```

### Try-Catch Pattern

```typescript
import { kelasApi, ApiError, NetworkError } from '@hakgyo-expo-sdk';

try {
  const response = await kelasApi.get(1);
  
  if (response.success) {
    // Handle success
    console.log('Class:', response.data);
  }
} catch (error) {
  if (error instanceof ApiError) {
    // API error (4xx, 5xx)
    console.error(`API Error: ${error.message}`);
    console.error(`Status: ${error.status}`);
    console.error(`Data:`, error.data);
    
    // Handle specific error codes
    switch (error.status) {
      case 401:
        showLoginRequired();
        break;
      case 402:
        handlePaymentRequired(error.data);
        break;
      case 403:
        showAccessDenied();
        break;
      case 404:
        showNotFound();
        break;
      default:
        showError(error.message);
    }
  } else if (error instanceof NetworkError) {
    // Network error (no connection, timeout, etc.)
    console.error('Network error:', error.message);
    showNetworkError();
  } else {
    // Unknown error
    console.error('Unknown error:', error);
    showGenericError();
  }
}
```

### Error Response Wrapper

```typescript
const safeApiCall = async <T>(
  apiCall: () => Promise<ApiResponse<T>>,
  onSuccess: (data: T) => void,
  onError?: (error: Error) => void
) => {
  try {
    setLoading(true);
    const response = await apiCall();
    
    if (response.success) {
      onSuccess(response.data);
    } else {
      throw new Error(response.error || 'Request failed');
    }
  } catch (error) {
    onError?.(error as Error);
  } finally {
    setLoading(false);
  }
};

// Usage
safeApiCall(
  () => kelasApi.get(1),
  (kelas) => setKelas(kelas),
  (error) => showError(error.message)
);
```

### Common Error Codes

| Status | Error | Description | Action |
|--------|-------|-------------|--------|
| 400 | Bad Request | Invalid parameters | Validate input |
| 401 | Unauthorized | Authentication required | Redirect to login |
| 402 | Payment Required | Class requires payment | Show payment flow |
| 403 | Forbidden | Access denied | Show access denied message |
| 404 | Not Found | Class not found | Show not found message |
| 500 | Internal Server Error | Server error | Show generic error message |

---

## Sequential Learning Progress

The Kelas SDK implements a sequential learning system where users must complete materials in order.

### Access Control Logic

Materials are unlocked based on the following rules:

1. **First material** is always accessible
2. **Subsequent materials** unlock only after previous material is fully completed
3. **If previous material has assessment**, user must pass it to unlock next material

### Material States

```typescript
interface MaterialState {
  // User can view this material
  isAccessible: boolean;
  
  // User has marked content as complete
  isCompleted: boolean;
  
  // Both content AND assessment are complete
  isFullyCompleted: boolean;
  
  // Material has a required assessment
  hasAssessment: boolean;
  
  // User has passed the assessment
  assessmentPassed: boolean;
  
  // User's latest assessment score
  score: number | null;
  
  // User can retake the assessment
  canRetake: boolean;
}
```

### Progress Tracking Example

```typescript
import { kelasApi } from '@hakgyo-expo-sdk';

const ClassProgressScreen = ({ kelasId }: { kelasId: number }) => {
  const [progress, setProgress] = useState<KelasProgressResponse | null>(null);
  
  useEffect(() => {
    loadProgress();
  }, [kelasId]);
  
  const loadProgress = async () => {
    const response = await kelasApi.getProgress(kelasId);
    
    if (response.success) {
      setProgress(response.data);
    }
  };
  
  if (!progress) return <Loading />;
  
  const { materis, overallProgress } = progress;
  
  return (
    <View>
      {/* Overall Progress */}
      <ProgressCard
        percentage={overallProgress.completionPercentage}
        label={`${overallProgress.completedCount}/${overallProgress.totalCount} completed`}
      />
      
      {/* Material List */}
      <FlatList
        data={materis}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MaterialItem
            title={item.title}
            order={item.order}
            isAccessible={item.isAccessible}
            isCompleted={item.isCompleted}
            hasAssessment={item.hasAssessment}
            score={item.score}
            onPress={() => {
              if (!item.isAccessible) {
                Alert.alert(
                  'Locked',
                  'Complete the previous material to unlock this one'
                );
                return;
              }
              navigateToMaterial(item.id);
            }}
          />
        )}
      />
    </View>
  );
};
```

### Progress Calculation

The overall progress is calculated as:

```typescript
const completedCount = materis.filter(m => m.isFullyCompleted).length;
const totalCount = materis.length;
const completionPercentage = Math.round((completedCount / totalCount) * 100);
```

---

## Related SDK Modules

- **Materi SDK** - Manage class materials
- **Vocabulary SDK** - Manage vocabulary sets
- **Soal SDK** - Manage questions and collections
- **Tryout SDK** - Manage tryout exams
- **User SDK** - User profile and data

---

## Additional Resources

- [SDK Overview](./sdk-overview.md)
- [API Client Reference](../packages/hakgyo-expo-sdk/src/api/client.ts)
- [Type Definitions](../packages/hakgyo-expo-sdk/src/types/models.ts)
