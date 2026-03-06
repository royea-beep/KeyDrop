import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { encrypt } from '@/lib/crypto';
import { submitCredentialsSchema } from '@/lib/validation';
import { submitLimiter, applyRateLimit } from '@/lib/rate-limit';

// POST /api/submit/[token] — client submits credentials (public, no auth)
export async function POST(req: NextRequest) {
  const rateLimitResponse = await applyRateLimit(submitLimiter, req);
  if (rateLimitResponse) return rateLimitResponse;
  const token = req.nextUrl.pathname.split('/').pop()!;

  const request = await prisma.credentialRequest.findUnique({
    where: { token },
    include: { fields: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!request) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  }

  if (request.status === 'SUBMITTED' || request.status === 'RETRIEVED') {
    return NextResponse.json({ error: 'Credentials already submitted' }, { status: 410 });
  }

  if (request.status === 'REVOKED') {
    return NextResponse.json({ error: 'This link has been revoked' }, { status: 410 });
  }

  if (new Date() > request.expiresAt) {
    await prisma.credentialRequest.update({ where: { id: request.id }, data: { status: 'EXPIRED' } });
    return NextResponse.json({ error: 'This link has expired' }, { status: 410 });
  }

  try {
    const body = await req.json();
    const data = submitCredentialsSchema.parse(body);

    // Validate required fields
    for (const field of request.fields) {
      if (field.required && !data.fields[field.id]) {
        return NextResponse.json({ error: `Field "${field.label}" is required` }, { status: 400 });
      }
    }

    // Encrypt and store each field value
    for (const field of request.fields) {
      const value = data.fields[field.id];
      if (!value) continue;

      const { ciphertext, iv, authTag } = encrypt(value);
      await prisma.credentialField.update({
        where: { id: field.id },
        data: { encryptedValue: ciphertext, iv, authTag },
      });
    }

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

    await prisma.credentialRequest.update({
      where: { id: request.id },
      data: { status: 'SUBMITTED', submittedAt: new Date(), submitterIp: clientIp },
    });

    await prisma.auditLog.create({
      data: {
        requestId: request.id,
        action: 'creds_submitted',
        ipAddress: clientIp,
        userAgent: req.headers.get('user-agent'),
        metadata: JSON.stringify({ fieldCount: Object.keys(data.fields).length }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('Submit error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
