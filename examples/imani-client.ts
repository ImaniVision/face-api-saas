/**
 * Imani Vision API client for YOUR SERVER. Never ship your API key to a browser or app:
 * the browser sends photos to your backend, and your backend calls Imani Vision with this client.
 *
 * No dependencies: Node 18+ (fetch, FormData and Blob are built in). Plain TypeScript with no
 * parameter properties or enums, so Node 22.18+ can run it directly (`node your-file.ts`).
 *
 *   const imani = new ImaniClient(process.env.IMANI_API_URL!, process.env.IMANI_API_KEY!);
 *   await imani.enroll("customer-42", fivePhotos, { consentReference: "signup-form-v3" });
 *   const { match } = await imani.verify("customer-42", newPhoto);
 *   await imani.delete("customer-42");
 */

export const ENROLMENT_PHOTOS = 5;

export interface Enrolment {
  externalId: string;
  consentId: string;
  consentGrantedAt: string;
}

/** A failed call. `status` tells you what to do; `message` is safe to log or show. */
export class ImaniError extends Error {
  readonly status: number;
  /** Seconds to wait before retrying, on 429. */
  readonly retryAfter?: number;

  constructor(status: number, message: string, retryAfter?: number) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }

  /** 400: a photo had no face, several faces, or didn't match the others. Ask for new photos. */
  get badPhoto(): boolean {
    return this.status === 400;
  }

  /** 404: nobody is enrolled under this ID. */
  get notEnrolled(): boolean {
    return this.status === 404;
  }

  /** 409: enrolled before protected templates existed. Enroll them again with 5 photos. */
  get mustReenroll(): boolean {
    return this.status === 409;
  }
}

export class ImaniClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Enroll (or re-enroll) a person from exactly 5 different photos (JPEG, PNG or WebP, <= 5 MB,
   * one face each). Only call this after the person has agreed: the API records the consent.
   */
  async enroll(
    externalId: string,
    photos: Uint8Array[],
    { consentReference }: { consentReference?: string } = {},
  ): Promise<Enrolment> {
    if (photos.length !== ENROLMENT_PHOTOS) {
      throw new ImaniError(400, `Enrollment needs exactly ${ENROLMENT_PHOTOS} photos, got ${photos.length}`);
    }
    const form = new FormData();
    photos.forEach((photo, i) => form.append("images", new Blob([new Uint8Array(photo)]), `photo-${i + 1}.jpg`));
    form.append("consent", "true");
    if (consentReference) form.append("consent_reference", consentReference);
    return this.call<Enrolment>("PUT", this.path(externalId), form);
  }

  /** 1:1 check: is this photo the person enrolled as `externalId`? */
  async verify(externalId: string, photo: Uint8Array): Promise<{ match: boolean }> {
    const form = new FormData();
    form.append("image", new Blob([new Uint8Array(photo)]), "photo.jpg");
    return this.call<{ match: boolean }>("POST", `${this.path(externalId)}/verify`, form);
  }

  /** Delete the person, their template and their consent records. */
  async delete(externalId: string): Promise<void> {
    await this.call<null>("DELETE", this.path(externalId));
  }

  private path(externalId: string): string {
    return `/v1/subjects/${encodeURIComponent(externalId)}`;
  }

  private async call<T>(method: string, path: string, body?: FormData): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      method,
      headers: { "x-api-key": this.apiKey },
      body,
    });
    if (res.status === 204) return null as T;
    const data: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const message = (data as { message?: unknown } | null)?.message;
      throw new ImaniError(
        res.status,
        Array.isArray(message) ? message.join("; ") : String(message ?? res.statusText),
        res.status === 429 ? Number(res.headers.get("retry-after")) || undefined : undefined,
      );
    }
    return data as T;
  }
}
