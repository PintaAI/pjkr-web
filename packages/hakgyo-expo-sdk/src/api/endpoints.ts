export const API_ENDPOINTS = {
  // Auth Endpoints
  AUTH: {
    SIGN_UP_EMAIL: '/api/auth/sign-up/email',
    SIGN_IN_EMAIL: '/api/auth/sign-in/email',
    SIGN_IN_SOCIAL: '/api/auth/sign-in/social',
    SIGN_OUT: '/api/auth/sign-out',
    GET_SESSION: '/api/auth/get-session',
    SESSION: '/api/auth/session',
    USER: '/api/auth/user',
  },
  
  // Kelas Endpoints
  KELAS: {
    LIST: '/api/kelas',
    GET: (id: number) => `/api/kelas/${id}`,
    CREATE: '/api/kelas',
    UPDATE: (id: number) => `/api/kelas/${id}`,
    DELETE: (id: number) => `/api/kelas/${id}`,
    JOIN: (id: number) => `/api/kelas/${id}/join`,
    LEAVE: (id: number) => `/api/kelas/${id}/leave`,
    MATERIALS: (id: number) => `/api/kelas/${id}/materi`,
  },
  
  // Materi Endpoints
  MATERI: {
    GET: (id: number) => `/api/materi/${id}`,
    COMPLETE: (id: number) => `/api/materi/${id}/complete`,
    ASSESSMENT: (id: number) => `/api/materi/${id}/assessment`,
    ASSESSMENT_CONFIG: (id: number) => `/api/materi/${id}/assessment-config`,
  },
  
  // Vocabulary Endpoints
  VOCABULARY: {
    DAILY: '/api/vocabulary/daily',
    SETS: '/api/vocabulary-sets',
    SET_GET: (id: number) => `/api/vocabulary-sets/${id}`,
    ITEMS: '/api/vocabulary-items',
    ITEM_GET: (id: number) => `/api/vocabulary-items/${id}`,
  },
  
  // Soal Endpoints
  SOAL: {
    LIST: '/api/soal',
    GET: (id: number) => `/api/soal/${id}`,
    CREATE: '/api/soal',
    UPDATE: (id: number) => `/api/soal/${id}`,
    DELETE: (id: number) => `/api/soal/${id}`,
    TOGGLE_ACTIVE: (id: number) => `/api/soal/${id}/toggle-active`,
  },
  
  // Tryout Endpoints
  TRYOUT: {
    LIST: '/api/tryout',
    GET: (id: number) => `/api/tryout/${id}`,
    PARTICIPATE: (id: number) => `/api/tryout/${id}/participate`,
    SUBMIT: (id: number) => `/api/tryout/${id}/submit`,
    RESULTS: (id: number) => `/api/tryout/${id}/results`,
    TOGGLE_ACTIVE: (id: number) => `/api/tryout/${id}/toggle-active`,
  },
  
  // Posts Endpoints
  POSTS: {
    LIST: '/api/posts',
    GET: (id: number) => `/api/posts/${id}`,
    CREATE: '/api/posts',
    UPDATE: (id: number) => `/api/posts/${id}`,
    DELETE: (id: number) => `/api/posts/${id}`,
    LIKE: (id: number) => `/api/posts/${id}/like`,
    COMMENTS: (id: number) => `/api/posts/${id}/comments`,
  },
  
  // User Endpoints
  USER: {
    PROFILE: '/api/user/profile',
    KELAS: (userId: string) => `/api/users/${userId}/kelas`,
    TRYOUT_RESULTS: (userId: string) => `/api/users/${userId}/tryout-results`,
  },
  
  // Push Notifications Endpoints
  PUSH: {
    REGISTER: '/api/push-tokens/register',
    TOKENS: '/api/push-tokens',
    TOKEN_GET: (id: string) => `/api/push-tokens/${id}`,
    SEND: '/api/push-notifications/send',
  },
} as const;
