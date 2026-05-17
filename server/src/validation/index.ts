import { z } from 'zod';
import { ValidationError } from '@/errors/AppError.js';

const zodToMessage = (err: z.ZodError): string => {
  return err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
};

/** Validates data against a Zod schema, throwing a ValidationError on failure. */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(zodToMessage(result.error));
  }
  return result.data;
}
