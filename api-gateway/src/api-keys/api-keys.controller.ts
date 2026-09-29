import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  create(@Request() req: any, @Body('name') name: string) {
    const userId = req.user.sub;
    return this.apiKeysService.createKey(userId, name || 'Default Key');
  }

  @Get()
  findAll(@Request() req: any) {
    const userId = req.user.sub;
    return this.apiKeysService.listKeys(userId);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body('name') name: string) {
    const userId = req.user.sub;
    return this.apiKeysService.renameKey(userId, id, name);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.apiKeysService.revokeKey(userId, id);
  }
}
