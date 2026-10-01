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

const vectorizeResponse = z.object({ vector: z.array(z.number()) });
const verifyResponse = z.object({
  match: z.boolean(),
  confidence: z.number(),
});
const mlError = z.object({ detail: z.string() });

export type Verification = z.infer<typeof verifyResponse>;

/**
 * The gateway's only door to the ML service. The match decision (and τ) live there —
 * never compare embeddings in TypeScript.
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

  async vectorize(image: Buffer): Promise<number[]> {
    const form = this.imageForm(image);
    const data = await this.post('/vectorize', form);
    return this.parse(vectorizeResponse, data).vector;
  }

  async verify(image: Buffer, savedVector: number[]): Promise<Verification> {
    const form = this.imageForm(image);
    form.append('saved_vector', JSON.stringify(savedVector));
    const data = await this.post('/verify_user', form);
    return this.parse(verifyResponse, data);
  }

  private imageForm(image: Buffer): FormData {
    const form = new FormData();
    form.append('file', image, { filename: 'image' });
    return form;
  }

  private async post(path: string, form: FormData): Promise<unknown> {
    try {
      const response = await firstValueFrom(
        this.http.post<unknown>(`${this.baseUrl}${path}`, form, {
          headers: {
            ...form.getHeaders(),
            'X-ML-Service-Key': this.serviceKey,
          },
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
