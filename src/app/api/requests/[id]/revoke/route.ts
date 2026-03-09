import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth, type AuthRouteHandler } from '@royea/shared-utils/auth-guard';

// POST /api/requests/[id]/revoke — manually expire a link
export const POST = withAuth((async (req: Parameters<AuthRouteHandler>[0], userId: string) => {
  const segments = req.nextUrl.pathname.split('/');
  const id = segments[segments.indexOf('requests') + 1];

  const request = await prisma.credentialRequest.findFirst({ where: { id, userId } });
  if (!request) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (request.status === 'REVOKED') {
    return NextResponse.json({ error: 'Already revoked' }, { status: 400 });
  }

  await prisma.credentialRequest.update({
    where: { id },
    data: { status: 'REVOKED', revokedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: { requestId: id, userId, action: 'link_revoked' },
  });

  return NextResponse.json({ success: true });
}) as unknown as AuthRouteHandler) as unknown as (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;
