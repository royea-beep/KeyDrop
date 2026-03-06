import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth-guard';

// GET /api/requests/[id] — get request detail
export const GET = withAuth(async (_req: NextRequest, userId: string) => {
  const id = _req.nextUrl.pathname.split('/').pop()!;

  const request = await prisma.credentialRequest.findFirst({
    where: { id, userId },
    include: {
      fields: { select: { id: true, label: true, fieldType: true, required: true, sortOrder: true, hint: true, encryptedValue: true }, orderBy: { sortOrder: 'asc' } },
      oauthConnections: true,
      auditLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });

  if (!request) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...request,
    fields: request.fields.map((f) => ({ ...f, hasValue: !!f.encryptedValue, encryptedValue: undefined })),
    link: `${process.env.NEXT_PUBLIC_APP_URL || ''}/s/${request.token}`,
  });
});

// DELETE /api/requests/[id] — delete request and all encrypted data
export const DELETE = withAuth(async (_req: NextRequest, userId: string) => {
  const id = _req.nextUrl.pathname.split('/').pop()!;

  const request = await prisma.credentialRequest.findFirst({ where: { id, userId } });
  if (!request) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.credentialRequest.delete({ where: { id } });

  await prisma.auditLog.create({
    data: { userId, action: 'request_deleted', metadata: { requestTitle: request.title } },
  });

  return NextResponse.json({ success: true });
});
