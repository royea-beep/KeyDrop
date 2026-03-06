import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
  businessName: z.string().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createRequestSchema = z.object({
  title: z.string().min(1).max(200),
  clientName: z.string().min(1).max(100),
  clientEmail: z.string().email().optional().or(z.literal('')),
  clientPhone: z.string().max(20).optional().or(z.literal('')),
  projectName: z.string().max(100).optional().or(z.literal('')),
  note: z.string().max(1000).optional().or(z.literal('')),
  language: z.enum(['en', 'he']).default('en'),
  expiresInHours: z.number().min(1).max(168).default(48),
  templateSlug: z.string().optional(),
  fields: z.array(z.object({
    label: z.string().min(1).max(200),
    fieldType: z.enum(['TEXT', 'SECRET', 'URL']).default('TEXT'),
    required: z.boolean().default(true),
    placeholder: z.string().max(200).optional(),
    hint: z.string().max(500).optional(),
    validationPattern: z.string().max(200).optional(),
  })).min(1).max(20),
  oauthProviders: z.array(z.object({
    provider: z.string(),
    providerLabel: z.string(),
    scopes: z.string().optional(),
  })).optional(),
});

export const submitCredentialsSchema = z.object({
  fields: z.record(z.string(), z.string().max(10000)),
});
