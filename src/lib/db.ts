import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// For Vercel/production: use environment variable directly
// For local development: add pgbouncer settings
function getDatabaseUrl() {
  const url = process.env.DATABASE_URL
  
  if (!url) {
    console.error('DATABASE_URL environment variable is not set!')
    throw new Error('DATABASE_URL environment variable is required')
  }
  
  // If running on Vercel or already has pgbouncer, use as-is
  if (process.env.VERCEL || url.includes('pgbouncer=true')) {
    return url
  }
  
  // For local development, add pgbouncer settings
  return `${url}${url.includes('?') ? '&' : '?'}pgbouncer=true&connection_limit=1`
}

const databaseUrl = getDatabaseUrl()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasourceUrl: databaseUrl,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
