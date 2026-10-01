import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiKeysService } from '../api-keys/api-keys.service';
import { ApiKeyAuthGuard, extractApiKey } from './api-key.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthedRequest } from './types';

/**
 * /v1 accepts an API key (integrations) or a portal session (the dashboard's live demo).
 * Either way the caller must be a developer with a verified email.
 */
@Injectable()
export class DeveloperAuthGuard implements CanActivate {
  private readonly apiKeyGuard: ApiKeyAuthGuard;
  private readonly jwtGuard: JwtAuthGuard;

  constructor(
    private readonly apiKeysService: ApiKeysService,
    jwtService: JwtService,
  ) {
    this.apiKeyGuard = new ApiKeyAuthGuard(apiKeysService);
    this.jwtGuard = new JwtAuthGuard(jwtService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    if (extractApiKey(request)) {
      return this.apiKeyGuard.canActivate(context);
    }
    await this.jwtGuard.canActivate(context);
    await this.apiKeysService.assertEmailVerified(request.user.sub);
    return true;
  }
}
