import { Inject, Injectable, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, count, desc, eq, gte, sql } from 'drizzle-orm';
import { DRIZZLE } from '../db/db.module';
import * as schema from '../db/schema';
import { RATE_LIMITS } from '../rate-limit/rate-limit.guard';

const WINDOW_DAYS = 30;

@Injectable()
export class UsageService {
  private readonly logger = new Logger(UsageService.name);

  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  record(entry: typeof schema.apiUsage.$inferInsert): void {
    this.db
      .insert(schema.apiUsage)
      .values(entry)
      .execute()
      .catch((err: unknown) =>
        this.logger.error(`Failed to record usage: ${String(err)}`),
      );
  }

  async summary(userId: string) {
    const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const inWindow = and(
      eq(schema.apiUsage.userId, userId),
      gte(schema.apiUsage.createdAt, since),
    );
    const day = sql<string>`to_char(date_trunc('day', ${schema.apiUsage.createdAt}), 'YYYY-MM-DD')`;
    const succeeded =
      sql<number>`count(*) filter (where ${schema.apiUsage.statusCode} < 400)`.mapWith(
        Number,
      );

    const [byDay, byKey] = await Promise.all([
      this.db
        .select({ day, calls: count(), succeeded })
        .from(schema.apiUsage)
        .where(inWindow)
        .groupBy(day)
        .orderBy(day),
      this.db
        .select({
          apiKeyId: schema.apiUsage.apiKeyId,
          name: schema.apiKeys.name,
          lastFour: schema.apiKeys.lastFour,
          calls: count(),
        })
        .from(schema.apiUsage)
        .leftJoin(
          schema.apiKeys,
          eq(schema.apiUsage.apiKeyId, schema.apiKeys.id),
        )
        .where(inWindow)
        .groupBy(
          schema.apiUsage.apiKeyId,
          schema.apiKeys.name,
          schema.apiKeys.lastFour,
        )
        .orderBy(desc(count())),
    ]);

    return {
      windowDays: WINDOW_DAYS,
      totalCalls: byDay.reduce((sum, d) => sum + d.calls, 0),
      succeededCalls: byDay.reduce((sum, d) => sum + d.succeeded, 0),
      byDay,
      byKey,
      rateLimit: RATE_LIMITS.developer,
    };
  }
}
