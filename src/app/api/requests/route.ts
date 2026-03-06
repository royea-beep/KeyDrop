import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/crypto';
import { createRequestSchema } from '@/lib/validation';
import { withAuth } from '@/lib/auth-guard';
import { AUTO_PURGE_DAYS } from '@/lib/constants';

// Probabilistic auto-purge: delete expired/completed requests older than AUTO_PURGE_DAYS
// Runs ~10% of GET requests to avoid running every time
async function maybeAutoPurge() {
  if (Math.random() > 0.1) return;
  try {
    const cutoff = new Date(Date.now() - AUTO_PURGE_DAYS * 24 * 60 * 60 * 1000);
    await prisma.credentialRequest.deleteMany({
      where: {
        status: { in: ['EXPIRED', 'REVOKED'] },
        updatedAt: { lt: cutoff },
      },
    });
  } catch (err) {
    console.error('Auto-purge error:', err);
  }
}

// GET /api/requests — list all requests for authenticated user
export const GET = withAuth(async (_req: NextRequest, userId: string) => {
  // Fire-and-forget auto-purge (non-blocking)
  maybeAutoPurge();
  const requests = await prisma.credentialRequest.findMany({
    where: { userId },
    include: {
      fields: { select: { id: true, label: true, fieldType: true, encryptedValue: true } },
      oauthConnections: { select: { id: true, provider: true, providerLabel: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const mapped = requests.map((r) => ({
    ...r,
    fields: r.fields.map((f) => ({ ...f, hasValue: !!f.encryptedValue, encryptedValue: undefined })),
    link: `${process.env.NEXT_PUBLIC_APP_URL || ''}/s/${r.token}`,
  }));

  return NextResponse.json(mapped);
});

// POST /api/requests — create a new credential request
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const body = await req.json();
    const data = createRequestSchema.parse(body);

    const token = generateToken();
    const expiresAt = new Date(Date.now() + data.expiresInHours * 60 * 60 * 1000);

    const request = await prisma.credentialRequest.create({
      data: {
        userId,
        title: data.title,
        clientName: data.clientName,
        clientEmail: data.clientEmail || null,
        clientPhone: data.clientPhone || null,
        projectName: data.projectName || null,
        note: data.note || null,
        language: data.language,
        templateSlug: data.templateSlug || null,
        token,
        expiresAt,
        fields: {
          create: data.fields.map((f, i) => ({
            label: f.label,
            fieldType: f.fieldType,
            required: f.required,
            sortOrder: i,
            placeholder: f.placeholder || null,
            hint: f.hint || null,
            validationPattern: f.validationPattern || null,
          })),
        },
        oauthConnections: data.oauthProviders
          ? {
              create: data.oauthProviders.map((o) => ({
                provider: o.provider,
                providerLabel: o.providerLabel,
                scopes: o.scopes || null,
              })),
            }
          : undefined,
      },
      include: { fields: true, oauthConnections: true },
    });

    await prisma.auditLog.create({
      data: { requestId: request.id, userId, action: 'link_created' },
    });

    return NextResponse.json({
      ...request,
      link: `${process.env.NEXT_PUBLIC_APP_URL || ''}/s/${token}`,
    }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', details: err }, { status: 400 });
    }
    console.error('Create request error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
