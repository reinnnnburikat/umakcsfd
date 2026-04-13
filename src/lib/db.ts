import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use pooler connection with pgbouncer mode for Supabase
// The pooler connection is the only one accessible in this environment
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.nqbswodpygegaqdzjokr:T7VBtBFB5ska1Tnz@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasourceUrl: DATABASE_URL,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db