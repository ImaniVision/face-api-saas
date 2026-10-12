import {
  Controller,
  Post,
  Delete,
  Body,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
} from '@nestjs/common';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthedRequest } from './types';
import { ImageFilePipe, ImageUpload } from '../common/image-upload';
import { ZodPipe } from '../common/zod.pipe';
import { RateLimitGuard } from '../rate-limit/rate-limit.guard';

const email = z.email().max(254).toLowerCase();
const credentials = z.object({ email, password: z.string().min(8).max(128) });
const loginCredentials = z.object({ email, password: z.string().max(128) });
const verifyEmailBody = z.object({ token: z.string().min(1).max(128) });
const faceLogin = z.object({ email });
const faceRegister = z.object({
  email,
  consent: z.literal('true', {
    error: 'consent must be "true": face enrollment requires your consent',
  }),
});

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('email-register')
  @UseGuards(RateLimitGuard)
  emailRegister(
    @Body(new ZodPipe(credentials)) body: z.infer<typeof credentials>,
  ) {
    return this.authService.emailRegister(body.email, body.password);
  }

  @Post('verify-email')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  verifyEmail(
    @Body(new ZodPipe(verifyEmailBody)) body: z.infer<typeof verifyEmailBody>,
  ) {
    return this.authService.verifyEmail(body.token);
  }

  @Post('email-login')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  emailLogin(
    @Body(new ZodPipe(loginCredentials))
    body: z.infer<typeof loginCredentials>,
  ) {
    return this.authService.emailLogin(body.email, body.password);
  }

  /** Face-login demo of the API. Requires consent before any embedding is stored. */
  @Post('register')
  @UseGuards(RateLimitGuard)
  @UseInterceptors(ImageUpload())
  register(
    @Body(new ZodPipe(faceRegister)) body: z.infer<typeof faceRegister>,
    @UploadedFile(ImageFilePipe) image: Buffer,
  ) {
    return this.authService.register(body.email, image);
  }

  @Post('login')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  @UseInterceptors(ImageUpload())
  login(
    @Body(new ZodPipe(faceLogin)) body: z.infer<typeof faceLogin>,
    @UploadedFile(ImageFilePipe) image: Buffer,
  ) {
    return this.authService.login(body.email, image);
  }

  /** Delete my account and everything attached to it. */
  @Delete('me')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  deleteMe(@Req() req: AuthedRequest) {
    return this.authService.deleteAccount(req.user.sub);
  }
}
