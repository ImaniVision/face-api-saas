import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { DRIZZLE } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq, and } from 'drizzle-orm';
import * as crypto from 'crypto';

export const API_KEY_PREFIX = 'sk_live_';
const API_KEY_FORMAT = /^sk_live_[0-9a-f]{64}$/;

const hashKey = (rawKey: string) =>
  crypto.createHash('sha256').update(rawKey).digest('hex');

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  async assertEmailVerified(userId: string): Promise<void> {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      columns: { emailVerifiedAt: true },
    });
    if (!user?.emailVerifiedAt) {
      throw new ForbiddenException('Verify your email address first.');
    }
  }

  async createKey(userId: string, name: string) {
    await this.assertEmailVerified(userId);

    const plainTextKey = `${API_KEY_PREFIX}${crypto.randomBytes(32).toString('hex')}`;

    const [apiKey] = await this.db
      .insert(schema.apiKeys)
      .values({
        userId,
        name,
        prefix: API_KEY_PREFIX,
        hashedKey: hashKey(plainTextKey),
        lastFour: plainTextKey.slice(-4),
        scopes: ['all'],
      })
      .returning();

    // The raw plaintext key is returned ONLY once during creation
    return {
      id: apiKey.id,
      name: apiKey.name,
      plainTextKey,
      createdAt: apiKey.createdAt,
    };
  }

  async listKeys(userId: string) {
    const keys = await this.db.query.apiKeys.findMany({
      where: and(
        eq(schema.apiKeys.userId, userId),
        eq(schema.apiKeys.isRevoked, false),
      ),
      orderBy: (apiKeys, { desc }) => [desc(apiKeys.createdAt)],
    });

    return keys.map((k) => ({
      id: k.id,
      name: k.name,
      prefix: k.prefix,
      lastFour: k.lastFour,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
    }));
  }

  async renameKey(userId: string, keyId: string, name: string) {
    const [updated] = await this.db
      .update(schema.apiKeys)
      .set({ name })
      .where(
        and(eq(schema.apiKeys.id, keyId), eq(schema.apiKeys.userId, userId)),
      )
      .returning();

    if (!updated) throw new NotFoundException('API key not found');
    return { success: true };
  }

  async revokeKey(userId: string, keyId: string) {
    const [revoked] = await this.db
      .update(schema.apiKeys)
      .set({ isRevoked: true })
      .where(
        and(eq(schema.apiKeys.id, keyId), eq(schema.apiKeys.userId, userId)),
      )
      .returning();

    if (!revoked) throw new NotFoundException('API key not found');
    return { success: true };
  }

  async validateKey(
    rawKey: string,
  ): Promise<{ userId: string; apiKeyId: string } | null> {
    if (!API_KEY_FORMAT.test(rawKey)) {
      return null;
    }

    const apiKey = await this.db.query.apiKeys.findFirst({
      where: and(
        eq(schema.apiKeys.hashedKey, hashKey(rawKey)),
        eq(schema.apiKeys.isRevoked, false),
      ),
    });

    if (!apiKey) {
      return null;
    }

    this.db
      .update(schema.apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(schema.apiKeys.id, apiKey.id))
      .execute()
      .catch((err: unknown) =>
        this.logger.warn(`Failed to update lastUsedAt: ${String(err)}`),
      );

    return { userId: apiKey.userId, apiKeyId: apiKey.id };
  }
}
