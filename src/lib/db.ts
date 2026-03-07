import { PrismaClient } from '../generated/prisma/client';

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL || '';
  const isPostgres = dbUrl.startsWith('postgres');

  if (isPostgres) {
    // Vercel/production: use Neon Postgres
    const { PrismaPg } = require('@prisma/adapter-pg');
    const adapter = new PrismaPg({ connectionString: dbUrl });
    return new PrismaClient({ adapter } as never);
  } else {
    // Local dev: use libSQL/SQLite
    const { PrismaLibSql } = require('@prisma/adapter-libsql');
    const adapter = new PrismaLibSql({ url: dbUrl });
    return new PrismaClient({ adapter } as never);
  }
}

const globalForPrisma = globalThis as unknown as { prisma: ReturnType<typeof createPrismaClient> };

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
