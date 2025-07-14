// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Learn more: https://jestjs.io/docs/configuration#setupfilesafterenv-array

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.DIRECT_URL = 'postgresql://test:test@localhost:5432/test_db'

// Mock Next.js request and response objects
global.Request = global.Request || class MockRequest {}
global.Response = global.Response || class MockResponse {}

// Setup test database or mock Prisma client if needed
// You can add database seeding or cleanup logic here
