import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiKeysService } from '../api-keys/api-keys.service';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('Missing API key. Provide via x-api-key header or Authorization: Bearer <key>.');
    }

    const result = await this.apiKeysService.validateKey(apiKey);

    if (!result) {
      throw new UnauthorizedException('Invalid or revoked API key.');
    }

    // Attach userId to request so downstream handlers can use it
    request['user'] = { id: result.userId, sub: result.userId };
    return true;
  }

  private extractApiKey(request: any): string | undefined {
    // Check x-api-key header first
    const xApiKey = request.headers['x-api-key'];
    if (xApiKey) return xApiKey;

    // Fall back to Authorization: Bearer <key>
    const authHeader = request.headers['authorization'];
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token?.startsWith('sk_live_')) {
        return token;
      }
    }

    return undefined;
  }
}
