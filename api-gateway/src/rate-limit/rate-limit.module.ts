import {
  Global,
  Inject,
  Logger,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS, RateLimitGuard } from './rate-limit.guard';

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redis = new Redis(config.getOrThrow<string>('REDIS_URL'), {
          // Fail fast instead of queueing requests while Redis is down.
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
        });
        const logger = new Logger('Redis');
        // Connection failures across IPv4/IPv6 arrive as an AggregateError with an empty message.
        redis.on('error', (err: Error) => {
          const causes =
            err instanceof AggregateError
              ? (err.errors as Error[]).map((e) => e.message)
              : [err.message];
          logger.warn(`Connection error: ${causes.join('; ')}`);
        });
        return redis;
      },
    },
    RateLimitGuard,
  ],
  exports: [REDIS, RateLimitGuard],
})
export class RateLimitModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async onApplicationShutdown() {
    await this.redis.quit();
  }
}
