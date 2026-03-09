import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import { withAuth, type AuthRouteHandler } from '@royea/shared-utils/auth-guard';
import type { CredentialField, OAuthConnection } from '@/generated/prisma/client';

// GET /api/requests/[id]/credentials — decrypt and return credentials
export const GET = withAuth((async (req: Parameters<AuthRouteHandler>[0], userId: string) => {
  const segments = req.nextUrl.pathname.split('/');
  const id = segments[segments.indexOf('requests') + 1];

  const request = await prisma.credentialRequest.findFirst({
    where: { id, userId },
    include: {
      fields: { orderBy: { sortOrder: 'asc' } },
      oauthConnections: true,
    },
  });

  if (!request) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (request.status === 'PENDING' || request.status === 'VIEWED') {
    return NextResponse.json({ error: 'Credentials not yet submitted' }, { status: 400 });
  }

  // Enforce maxViews limit
  if (request.viewCount >= request.maxViews) {
    return NextResponse.json(
      { error: 'Maximum view count exceeded. These credentials are no longer accessible.' },
      { status: 403 }
    );
  }

  // Decrypt manual fields
  const decryptedFields = request.fields
    .filter((f: CredentialField) => f.encryptedValue && f.iv && f.authTag)
    .map((f: CredentialField) => ({
      id: f.id,
      label: f.label,
      fieldType: f.fieldType,
      value: decrypt(f.encryptedValue!, f.iv!, f.authTag!),
    }));

  // Decrypt OAuth tokens
  const decryptedOAuth = request.oauthConnections
    .filter((o: OAuthConnection) => o.encryptedToken && o.iv && o.authTag && o.status === 'CONNECTED')
    .map((o: OAuthConnection) => ({
      id: o.id,
      provider: o.provider,
      providerLabel: o.providerLabel,
      accountName: o.accountName,
      token: decrypt(o.encryptedToken!, o.iv!, o.authTag!),
      tokenType: o.tokenType,
    }));

  // Mark as retrieved and increment view count
  await prisma.credentialRequest.update({
    where: { id },
    data: {
      status: 'RETRIEVED',
      retrievedAt: new Date(),
      viewCount: { increment: 1 },
    },
  });

  await prisma.auditLog.create({
    data: {
      requestId: id,
      userId,
      action: 'creds_retrieved',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    },
  });

  return NextResponse.json({ fields: decryptedFields, oauth: decryptedOAuth });
}) as unknown as AuthRouteHandler) as unknown as (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;
