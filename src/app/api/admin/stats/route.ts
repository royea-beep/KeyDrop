import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  if (!key || key !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const todayStart = new Date(new Date().toDateString());
  const next24h = new Date(Date.now() + 86400000);

  const [total, today, byStatus, expiringSoon, topViewed, recentRequests, userCount] =
    await Promise.all([
      prisma.credentialRequest.count(),
      prisma.credentialRequest.count({
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.credentialRequest.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.credentialRequest.findMany({
        where: {
          expiresAt: { gte: new Date(), lte: next24h },
          status: { not: 'EXPIRED' },
        },
        select: {
          id: true,
          title: true,
          clientName: true,
          expiresAt: true,
          status: true,
        },
        orderBy: { expiresAt: 'asc' },
        take: 10,
      }),
      prisma.credentialRequest.findMany({
        orderBy: { viewCount: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          viewCount: true,
          status: true,
          clientName: true,
        },
      }),
      prisma.credentialRequest.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          clientName: true,
          status: true,
          viewCount: true,
          createdAt: true,
          expiresAt: true,
        },
      }),
      prisma.user.count(),
    ]);

  const statusMap: Record<string, number> = {};
  for (const s of byStatus) {
    statusMap[s.status] = s._count.status;
  }

  return NextResponse.json({
    total,
    today,
    userCount,
    byStatus: statusMap,
    expiringSoon,
    topViewed,
    recentRequests,
  });
}
