import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { z } from 'zod';
import { DeveloperAuthGuard } from '../auth/developer-auth.guard';
import type { AuthedRequest } from '../auth/types';
import { ImageFilePipe, ImageUpload } from '../common/image-upload';
import { ZodPipe } from '../common/zod.pipe';
import { RateLimitGuard } from '../rate-limit/rate-limit.guard';
import { UsageInterceptor } from '../usage/usage.interceptor';
import { SubjectsService } from './subjects.service';

const externalIdPipe = new ZodPipe(
  z
    .string()
    .regex(
      /^[A-Za-z0-9_.@:-]{1,128}$/,
      'use 1-128 letters, digits or _ . @ : -',
    ),
);

const enrollBody = z.object({
  consent: z.literal('true', {
    error: 'consent must be "true": enrollment requires the subject’s consent',
  }),
  consent_reference: z.string().max(256).optional(),
});

@Controller('v1/subjects')
@UseGuards(DeveloperAuthGuard, RateLimitGuard)
@UseInterceptors(UsageInterceptor)
export class SubjectsController {
  constructor(private readonly subjects: SubjectsService) {}

  /** Enroll (or re-enroll) a person. Requires consent; the consent record is timestamped. */
  @Put(':externalId')
  @UseInterceptors(ImageUpload())
  enroll(
    @Req() req: AuthedRequest,
    @Param('externalId', externalIdPipe) externalId: string,
    @Body(new ZodPipe(enrollBody)) body: z.infer<typeof enrollBody>,
    @UploadedFile(ImageFilePipe) image: Buffer,
  ) {
    return this.subjects.enroll(req.user.sub, externalId, image, {
      method: req.apiKeyId ? 'api' : 'portal',
      reference: body.consent_reference,
    });
  }

  /** 1:1 verification: is this image the person enrolled as `externalId`? */
  @Post(':externalId/verify')
  @HttpCode(200)
  @UseInterceptors(ImageUpload())
  verify(
    @Req() req: AuthedRequest,
    @Param('externalId', externalIdPipe) externalId: string,
    @UploadedFile(ImageFilePipe) image: Buffer,
  ) {
    return this.subjects.verify(req.user.sub, externalId, image);
  }

  @Delete(':externalId')
  @HttpCode(204)
  remove(
    @Req() req: AuthedRequest,
    @Param('externalId', externalIdPipe) externalId: string,
  ) {
    return this.subjects.remove(req.user.sub, externalId);
  }
}
