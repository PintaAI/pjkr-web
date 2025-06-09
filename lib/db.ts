import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'

// Configure Neon for different environments
if (typeof window === 'undefined') {
  // Server-side configuration
  import('ws').then((ws) => {
    neonConfig.webSocketConstructor = ws.default
  })
} else {
  // Client-side - should not happen in this setup, but just in case
  neonConfig.poolQueryViaFetch = true
}

// For edge environments (Vercel Edge Functions), enable querying over fetch
if (process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'production') {
  neonConfig.poolQueryViaFetch = true
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!
  
  // Use Neon serverless adapter for better performance in serverless environments
  const adapter = new PrismaNeon({ connectionString })
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['info', 'warn', 'error'] : ['error'],
    errorFormat: 'pretty',
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
