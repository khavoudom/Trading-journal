import { z } from 'zod';

export const createTemplateTypeSchema = z.object({
  spaceId: z.string().min(1, 'spaceId is required'),
  name: z.string().min(1, 'Name is required').max(50),
  color: z.string().optional(),
});

export const createTemplateSchema = z.object({
  spaceId: z.string().min(1, 'spaceId is required'),
  name: z.string().min(1, 'Name is required').max(100),
  typeId: z.string().min(1, 'typeId is required'),
  items: z
    .array(
      z.object({
        type: z.enum(['checkbox', 'text', 'number']),
        label: z.string().min(1, 'Label is required'),
        value: z.string().optional(),
        order: z.number().int().min(0),
      }),
    )
    .min(1, 'At least one item is required'),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  typeId: z.string().min(1).optional(),
});

export const createTemplateItemSchema = z.object({
  type: z.enum(['checkbox', 'text', 'number']),
  label: z.string().min(1, 'Label is required'),
  value: z.string().optional(),
  order: z.number().int().min(0),
});

export const updateTemplateItemSchema = z.object({
  type: z.enum(['checkbox', 'text', 'number']).optional(),
  label: z.string().min(1).optional(),
  value: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
});
