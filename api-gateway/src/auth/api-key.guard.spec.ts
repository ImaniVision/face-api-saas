import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ApiKeysService } from '../api-keys/api-keys.service';
import * as schema from '../db/schema';
import { ApiKeyAuthGuard } from './api-key.guard';
import type { AuthedRequest } from './types';

const VALID_KEY = `sk_live_${'a1'.repeat(32)}`;

function setup(storedKey: { id: string; userId: string } | undefined) {
  const findFirst = jest.fn().mockResolvedValue(storedKey);
  const execute = jest.fn().mockResolvedValue(undefined);
  // Only the query surface validateKey touches. Revoked keys are filtered out by the
  // query itself (is_revoked = false), so to the service a revoked key is "not found".
  const db = {
    query: { apiKeys: { findFirst } },
    update: () => ({ set: () => ({ where: () => ({ execute }) }) }),
  } as unknown as NodePgDatabase<typeof schema>;

  const guard = new ApiKeyAuthGuard(new ApiKeysService(db));
  return { guard, findFirst };
}

function context(headers: Record<string, string>) {
  const request = { headers } as unknown as AuthedRequest;
  const ctx = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext;
  return { ctx, request };
}

describe('ApiKeyAuthGuard', () => {
  it('accepts a valid key via x-api-key and attaches the owner and key id', async () => {
    const { guard } = setup({ id: 'key-1', userId: 'user-1' });
    const { ctx, request } = context({ 'x-api-key': VALID_KEY });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(request.user).toEqual({ sub: 'user-1' });
    expect(request.apiKeyId).toBe('key-1');
  });

  it('accepts a valid key via Authorization: Bearer', async () => {
    const { guard } = setup({ id: 'key-1', userId: 'user-1' });
    const { ctx } = context({ authorization: `Bearer ${VALID_KEY}` });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('rejects a revoked (or unknown) key', async () => {
    const { guard, findFirst } = setup(undefined);
    const { ctx, request } = context({ 'x-api-key': VALID_KEY });

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      new UnauthorizedException('Invalid or revoked API key.'),
    );
    expect(findFirst).toHaveBeenCalledTimes(1);
    expect(request.user).toBeUndefined();
  });

  it.each([
    ['too short', 'sk_live_abc123'],
    ['wrong prefix', `sk_test_${'a1'.repeat(32)}`],
    ['non-hex secret', `sk_live_${'zz'.repeat(32)}`],
    ['trailing junk', `${VALID_KEY}x`],
  ])(
    'rejects a malformed key (%s) without touching the database',
    async (_, key) => {
      const { guard, findFirst } = setup({ id: 'key-1', userId: 'user-1' });
      const { ctx } = context({ 'x-api-key': key });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(findFirst).not.toHaveBeenCalled();
    },
  );

  it('rejects a request with no key, and ignores non-key bearer tokens', async () => {
    const { guard, findFirst } = setup({ id: 'key-1', userId: 'user-1' });

    await expect(guard.canActivate(context({}).ctx)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(
      guard.canActivate(
        context({ authorization: 'Bearer eyJhbGciOi.jwt.token' }).ctx,
      ),
    ).rejects.toThrow(UnauthorizedException);
    expect(findFirst).not.toHaveBeenCalled();
  });
});
