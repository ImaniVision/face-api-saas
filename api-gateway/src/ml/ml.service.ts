import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import { z } from 'zod';
import { ENROLMENT_PHOTOS, MAX_IMAGE_BYTES } from '../common/image-upload';

const DIGEST_BYTES = 32;
// Bytes of P per template version (mirrors HELPER_BYTES in app/protection.py).
const HELPER_BYTES = { 1: 512 * 512 * 4, 2: 512 * 2 + 512 * 512 } as const;
export type TemplateVersion = keyof typeof HELPER_BYTES;
export const isTemplateVersion = (v: number): v is TemplateVersion =>
  v in HELPER_BYTES;

const base64 = z.string().transform((s) => Buffer.from(s, 'base64'));

const enrollResponse = z
  .object({
    digest: base64.refine((b) => b.length === DIGEST_BYTES, 'bad digest'),
    helper: base64,
    version: z.union([z.literal(1), z.literal(2)]),
  })
  .refine((t) => t.helper.length === HELPER_BYTES[t.version], {
    message: 'helper size does not match its version',
  });
const verifyResponse = z.object({ match: z.boolean() });
const mlError = z.object({ detail: z.string() });

/** A cancelable template: SHA-256 of the secret codeword + the 512x512 matrix P, in `version`'s layout. */
export interface ProtectedTemplate {
  digest: Buffer;
  helper: Buffer;
  version: TemplateVersion;
}
export type Verification = z.infer<typeof verifyResponse>;

/**
 * The gateway's only door to the ML service. The match decision (and α) live there —
 * never compare faces in TypeScript. The gateway only ever holds protected templates.
 */
@Injectable()
export class MlService {
  private readonly logger = new Logger(MlService.name);
  private readonly baseUrl: string;
  private readonly serviceKey: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl = config.getOrThrow<string>('ML_SERVICE_URL');
    this.serviceKey = config.getOrThrow<string>('ML_SERVICE_API_KEY');
  }

  async enroll(images: Buffer[]): Promise<ProtectedTemplate> {
    const form = new FormData();
    images.forEach((image, i) =>
      form.append('files', image, { filename: `photo-${i + 1}` }),
    );
    const data = await this.post('/enroll', form);
    return this.parse(enrollResponse, data);
  }

  async verify(
    image: Buffer,
    template: ProtectedTemplate,
  ): Promise<Verification> {
    const form = new FormData();
    form.append('file', image, { filename: 'image' });
    form.append('helper', template.helper, {
      filename: 'helper',
      contentType: 'application/octet-stream',
    });
    form.append('digest', template.digest.toString('base64'));
    form.append('version', String(template.version));
    const data = await this.post('/verify', form);
    return this.parse(verifyResponse, data);
  }

  private async post(path: string, form: FormData): Promise<unknown> {
    try {
      const response = await firstValueFrom(
        this.http.post<unknown>(`${this.baseUrl}${path}`, form, {
          headers: {
            ...form.getHeaders(),
            'X-ML-Service-Key': this.serviceKey,
          },
          // axios caps request bodies at 10 MB; enrolment sends up to 5 x 5 MB photos.
          maxBodyLength: MAX_IMAGE_BYTES * (ENROLMENT_PHOTOS + 1),
        }),
      );
      return response.data;
    } catch (error) {
      // 400s are face-quality problems (no face, several faces, undecodable) — safe to relay.
      if (isAxiosError(error) && error.response?.status === 400) {
        const body = mlError.safeParse(error.response.data);
        throw new BadRequestException(
          body.success ? body.data.detail : 'Could not process image',
        );
      }
      this.logger.error(`ML service ${path} failed: ${String(error)}`);
      throw new BadGatewayException('Face service unavailable');
    }
  }

  private parse<T>(schema: z.ZodType<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      this.logger.error(
        `Unexpected ML service response: ${result.error.message}`,
      );
      throw new BadGatewayException(
        'Face service returned an invalid response',
      );
    }
    return result.data;
  }
}
