import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Response } from 'express';
import type Redis from 'ioredis';
import type { AuthedRequest } from '../auth/types';

export const REDIS = 'REDIS';

export interface Bucket {
  capacity: number;
  refillPerSec: number;
}

// Calibration knobs. Authenticated callers get a per-key (or per-session) bucket;
// anonymous auth endpoints (login, register, verify-email) get a strict per-IP bucket.
export const RATE_LIMITS = {
  developer: { capacity: 20, refillPerSec: 1 },
  anonymous: { capacity: 5, refillPerSec: 1 / 12 },
} satisfies Record<string, Bucket>;

// Atomic refill-then-take. Uses Redis TIME so every gateway instance shares one clock.
// Returns {allowed, remaining, retryAfterSec, resetSec}.
const TOKEN_BUCKET_LUA = `
local capacity = tonumber(ARGV[1])
local rate = tonumber(ARGV[2])
local t = redis.call('TIME')
local now = tonumber(t[1]) + tonumber(t[2]) / 1000000
local state = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
local tokens = tonumber(state[1]) or capacity
local ts = tonumber(state[2]) or now
tokens = math.min(capacity, tokens + (now - ts) * rate)
local allowed = 0
if tokens >= 1 then
  tokens = tokens - 1
  allowed = 1
end
redis.call('HSET', KEYS[1], 'tokens', tostring(tokens), 'ts', tostring(now))
redis.call('EXPIRE', KEYS[1], math.ceil(capacity / rate) + 1)
local retry = 0
if allowed == 0 then retry = math.ceil((1 - tokens) / rate) end
return {allowed, math.floor(tokens), retry, math.ceil((capacity - tokens) / rate)}
`;

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<AuthedRequest>();
    const response = http.getResponse<Response>();

    const caller = request.user?.sub;
    const [key, bucket] = caller
      ? [
          `rl:dev:${request.apiKeyId ?? `session:${caller}`}`,
          RATE_LIMITS.developer,
        ]
      : [`rl:ip:${request.ip}`, RATE_LIMITS.anonymous];

    let result: unknown;
    try {
      result = await this.redis.eval(
        TOKEN_BUCKET_LUA,
        1,
        key,
        bucket.capacity,
        bucket.refillPerSec,
      );
    } catch (err) {
      // Fail closed: without the limiter, face matching can be brute-forced.
      this.logger.error(`Rate limiter unavailable: ${String(err)}`);
      throw new ServiceUnavailableException('Rate limiter unavailable');
    }

    const [allowed, remaining, retryAfter, reset] = result as number[];
    response.setHeader('X-RateLimit-Limit', bucket.capacity);
    response.setHeader('X-RateLimit-Remaining', remaining);
    response.setHeader('X-RateLimit-Reset', reset);

    if (allowed !== 1) {
      response.setHeader('Retry-After', retryAfter);
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
