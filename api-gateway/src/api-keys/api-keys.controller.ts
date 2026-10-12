import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthedRequest } from '../auth/types';

@Controller('api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  create(@Req() req: AuthedRequest, @Body('name') name: string) {
    return this.apiKeysService.createKey(req.user.sub, name || 'Default Key');
  }

  @Get()
  findAll(@Req() req: AuthedRequest) {
    return this.apiKeysService.listKeys(req.user.sub);
  }

  @Patch(':id')
  update(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body('name') name: string,
  ) {
    return this.apiKeysService.renameKey(req.user.sub, id, name);
  }

  @Delete(':id')
  remove(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.apiKeysService.revokeKey(req.user.sub, id);
  }
}
