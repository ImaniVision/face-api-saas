import { Controller, Get, Module, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthedRequest } from '../auth/types';
import { UsageInterceptor } from './usage.interceptor';
import { UsageService } from './usage.service';

@Controller('usage')
@UseGuards(JwtAuthGuard)
class UsageController {
  constructor(private readonly usage: UsageService) {}

  @Get()
  summary(@Req() req: AuthedRequest) {
    return this.usage.summary(req.user.sub);
  }
}

@Module({
  controllers: [UsageController],
  providers: [UsageService, UsageInterceptor],
  exports: [UsageService, UsageInterceptor],
})
export class UsageModule {}
