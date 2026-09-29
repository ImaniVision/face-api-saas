import { Controller, Post, Body, UseInterceptors, UploadedFile, BadRequestException, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { ApiKeyAuthGuard } from './api-key.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('email-register')
  async emailRegister(@Body() body: { email: string; password: string }) {
    return this.authService.emailRegister(body.email, body.password);
  }

  @Post('email-login')
  async emailLogin(@Body() body: { email: string; password: string }) {
    return this.authService.emailLogin(body.email, body.password);
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('image'))
  async register(@Body('email') email: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    return this.authService.register(email, file.buffer);
  }

  @Post('login')
  @UseInterceptors(FileInterceptor('image'))
  async login(@Body('email') email: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    return this.authService.login(email, file.buffer);
  }

  /**
   * Protected by API Key — external developers use this endpoint.
   * Usage: POST /auth/verify-face with x-api-key header and a face image.
   */
  @Post('verify-face')
  @UseGuards(ApiKeyAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async verifyFace(@Request() req: any, @Body('email') email: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    return this.authService.login(email, file.buffer);
  }
}
