import { z } from 'zod';

const templateTradeItemSchema = z.object({
  itemId: z.string(),
  label: z.string(),
  type: z.enum(['checkbox', 'text', 'number']),
  checked: z.boolean(),
  value: z.string().nullable(),
});

const templateTradeAttachmentSchema = z.object({
  templateId: z.string(),
  templateName: z.string(),
  typeName: z.string(),
  items: z.array(templateTradeItemSchema),
});

export const createTradeSchema = z.object({
  instrument: z.string().min(1, 'Instrument is required'),
  side: z.enum(['Long', 'Short']),
  strategy: z.string().min(1, 'Strategy is required'),
  entryPrice: z.number().positive('Entry price must be positive'),
  exitPrice: z.number().positive('Exit price must be positive'),
  quantity: z.number().positive('Quantity must be positive'),
  entryTime: z.string().min(1, 'Entry time is required'),
  exitTime: z.string().min(1, 'Exit time is required'),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
  emotion: z.string().optional(),
  planData: z.array(templateTradeAttachmentSchema).optional(),
  setupData: z.array(templateTradeAttachmentSchema).optional(),
  spaceId: z.string().min(1, 'spaceId is required'),
  status: z.enum(['pending', 'running', 'closed']).optional(),
});

export const updateTradeSchema = z.object({
  instrument: z.string().min(1).optional(),
  side: z.enum(['Long', 'Short']).optional(),
  strategy: z.string().min(1).optional(),
  entryPrice: z.number().positive().optional(),
  exitPrice: z.number().positive().optional(),
  quantity: z.number().positive().optional(),
  entryTime: z.string().min(1).optional(),
  exitTime: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
  emotion: z.string().optional(),
  planData: z.array(templateTradeAttachmentSchema).optional(),
  setupData: z.array(templateTradeAttachmentSchema).optional(),
  spaceId: z.string().min(1).optional(),
  status: z.enum(['pending', 'running', 'closed']).optional(),
});
