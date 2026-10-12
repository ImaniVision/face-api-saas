import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import type { AuthedRequest } from '../auth/types';
import { UsageService } from './usage.service';

/** Meters every call that got past auth and rate limiting, successful or not. */
@Injectable()
export class UsageInterceptor implements NestInterceptor {
  constructor(private readonly usage: UsageService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<AuthedRequest>();
    const response = http.getResponse<Response>();
    const route = (request.route as { path?: string } | undefined)?.path;

    // 'finish' sees the final status, including ones set by exception filters.
    response.once('finish', () =>
      this.usage.record({
        userId: request.user.sub,
        apiKeyId: request.apiKeyId ?? null,
        endpoint: `${request.method} ${route ?? request.path}`,
        statusCode: response.statusCode,
      }),
    );
    return next.handle();
  }
}
