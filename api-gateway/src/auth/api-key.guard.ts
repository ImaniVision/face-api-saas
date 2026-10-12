import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { API_KEY_PREFIX, ApiKeysService } from '../api-keys/api-keys.service';
import type { AuthedRequest } from './types';

export function extractApiKey(request: Request): string | undefined {
  const xApiKey = request.headers['x-api-key'];
  if (typeof xApiKey === 'string' && xApiKey) return xApiKey;

  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  if (type === 'Bearer' && token?.startsWith(API_KEY_PREFIX)) return token;

  return undefined;
}

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const apiKey = extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException(
        'Missing API key. Provide via x-api-key header or Authorization: Bearer <key>.',
      );
    }

    const result = await this.apiKeysService.validateKey(apiKey);
    if (!result) {
      throw new UnauthorizedException('Invalid or revoked API key.');
    }

    request.user = { sub: result.userId };
    request.apiKeyId = result.apiKeyId;
    return true;
  }
}
