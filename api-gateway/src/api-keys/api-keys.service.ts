import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq, and } from 'drizzle-orm';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  async createKey(userId: string, name: string) {
    const randomBytes = crypto.randomBytes(32);
    const secretPart = randomBytes.toString('hex');
    const prefix = 'sk_live_';
    const plainTextKey = `${prefix}${secretPart}`;
    
    const hashedKey = crypto.createHash('sha256').update(plainTextKey).digest('hex');
    const lastFour = plainTextKey.slice(-4);

    const [apiKey] = await this.db.insert(schema.apiKeys).values({
      userId,
      name,
      prefix,
      hashedKey,
      lastFour,
      scopes: ['all'],
    }).returning();

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
      where: and(eq(schema.apiKeys.userId, userId), eq(schema.apiKeys.isRevoked, false)),
      orderBy: (apiKeys, { desc }) => [desc(apiKeys.createdAt)],
    });

    return keys.map(k => ({
      id: k.id,
      name: k.name,
      prefix: k.prefix,
      lastFour: k.lastFour,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
    }));
  }

  async renameKey(userId: string, keyId: string, name: string) {
    const [updated] = await this.db.update(schema.apiKeys)
      .set({ name })
      .where(and(eq(schema.apiKeys.id, keyId), eq(schema.apiKeys.userId, userId)))
      .returning();
      
    if (!updated) throw new NotFoundException('API key not found');
    return { success: true };
  }

  async revokeKey(userId: string, keyId: string) {
    const [revoked] = await this.db.update(schema.apiKeys)
      .set({ isRevoked: true })
      .where(and(eq(schema.apiKeys.id, keyId), eq(schema.apiKeys.userId, userId)))
      .returning();

    if (!revoked) throw new NotFoundException('API key not found');
    return { success: true };
  }

  async validateKey(rawKey: string): Promise<{ userId: string } | null> {
    // Quick format check
    if (!rawKey || !rawKey.startsWith('sk_live_')) {
      return null;
    }

    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await this.db.query.apiKeys.findFirst({
      where: and(
        eq(schema.apiKeys.hashedKey, hashedKey),
        eq(schema.apiKeys.isRevoked, false),
      ),
    });

    if (!apiKey) {
      return null;
    }

    // Update lastUsedAt asynchronously (fire-and-forget)
    this.db.update(schema.apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(schema.apiKeys.id, apiKey.id))
      .execute()
      .catch(() => {}); // swallow errors for non-critical tracking

    return { userId: apiKey.userId };
  }
}
