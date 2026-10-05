import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { z } from 'zod';
import { DeveloperAuthGuard } from '../auth/developer-auth.guard';
import type { AuthedRequest } from '../auth/types';
import { ImageUpload, OptionalImageFilePipe } from '../common/image-upload';
import { ZodPipe } from '../common/zod.pipe';
import { RateLimitGuard } from '../rate-limit/rate-limit.guard';
import { externalIdPipe } from '../subjects/subjects.controller';
import { UsageInterceptor } from '../usage/usage.interceptor';
import { TransactionsService } from './transactions.service';

const label = z.string().trim().min(1).max(128);

const paymentBody = z.object({
  // Minor units (cents, pesewas); multipart sends every field as a string.
  amount: z.coerce.number().int().positive().max(1_000_000_000),
  payee: label,
  device_id: label,
});

@Controller('v1/subjects')
@UseGuards(DeveloperAuthGuard, RateLimitGuard)
@UseInterceptors(UsageInterceptor)
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  /** Mock payment: the risk rules decide whether `image` (a selfie) is needed to approve it. */
  @Post(':externalId/transactions')
  @HttpCode(200)
  @UseInterceptors(ImageUpload())
  pay(
    @Req() req: AuthedRequest,
    @Param('externalId', externalIdPipe) externalId: string,
    @Body(new ZodPipe(paymentBody)) body: z.infer<typeof paymentBody>,
    @UploadedFile(OptionalImageFilePipe) image: Buffer | undefined,
  ) {
    return this.transactions.pay(
      req.user.sub,
      externalId,
      { amount: body.amount, payee: body.payee, deviceId: body.device_id },
      image,
    );
  }
}
