import { z } from 'zod';

export const webhookSchema = z.object({
  eventId: z.string().min(1).optional(),
  eventType: z.string().min(1),
  ticketId: z.string().min(1),
  title: z.string().optional(),
  status: z.string().optional(),
  assignedNik: z.string().optional(),
  slaDueAt: z.string().datetime().optional(),
}).passthrough();
