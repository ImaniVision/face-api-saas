import { Global, Module, OnApplicationShutdown, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS, RateLimitGuard } from './rate-limit.guard';

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Redis(config.getOrThrow<string>('REDIS_URL'), {
          // Fail fast instead of queueing requests while Redis is down.
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
        }),
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
