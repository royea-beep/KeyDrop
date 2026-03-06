import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/validate/[token] — check if a link is valid (public, no auth)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.pathname.split('/').pop()!;

  const request = await prisma.credentialRequest.findUnique({
    where: { token },
    include: {
      user: { select: { name: true, businessName: true, logoUrl: true } },
      fields: {
        select: { id: true, label: true, fieldType: true, required: true, sortOrder: true, placeholder: true, hint: true, validationPattern: true },
        orderBy: { sortOrder: 'asc' },
      },
      oauthConnections: {
        select: { id: true, provider: true, providerLabel: true, status: true },
      },
    },
  });

  if (!request) {
    return NextResponse.json({ valid: false, reason: 'not_found' }, { status: 404 });
  }

  if (request.status === 'REVOKED') {
    return NextResponse.json({ valid: false, reason: 'revoked' }, { status: 410 });
  }

  if (request.status === 'SUBMITTED' || request.status === 'RETRIEVED') {
    return NextResponse.json({ valid: false, reason: 'already_submitted' }, { status: 410 });
  }

  if (new Date() > request.expiresAt) {
    await prisma.credentialRequest.update({ where: { id: request.id }, data: { status: 'EXPIRED' } });
    return NextResponse.json({ valid: false, reason: 'expired' }, { status: 410 });
  }

  // Increment view count
  await prisma.credentialRequest.update({
    where: { id: request.id },
    data: {
      viewCount: { increment: 1 },
      status: request.status === 'PENDING' ? 'VIEWED' : request.status,
    },
  });

  await prisma.auditLog.create({
    data: {
      requestId: request.id,
      action: 'link_opened',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      userAgent: req.headers.get('user-agent'),
    },
  });

  return NextResponse.json({
    valid: true,
    developer: request.user,
    clientName: request.clientName,
    projectName: request.projectName,
    note: request.note,
    language: request.language,
    fields: request.fields,
    oauthConnections: request.oauthConnections.filter((o: { status: string }) => o.status === 'PENDING'),
    expiresAt: request.expiresAt,
  });
}
