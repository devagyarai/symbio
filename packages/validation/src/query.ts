import { z } from 'zod';
import { paginationSchema, searchSchema } from './index';

export const PaginationQuerySchema = paginationSchema.merge(searchSchema).extend({
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  organizationId: z.string().uuid().optional(),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const AuditQuerySchema = paginationSchema.merge(searchSchema).extend({
  sortBy: z.enum(['createdAt', 'action', 'entity']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  actorId: z.string().uuid().optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
  workspaceId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type AuditQuery = z.infer<typeof AuditQuerySchema>;

export const DashboardQuerySchema = z.object({
  organizationId: z.string().uuid().optional(),
  workspaceId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  /** Number of recent items to return for activity endpoints */
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type DashboardQuery = z.infer<typeof DashboardQuerySchema>;

