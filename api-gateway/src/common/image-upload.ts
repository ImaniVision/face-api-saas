import {
  BadRequestException,
  Injectable,
  PipeTransform,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { createHash } from 'crypto';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
// Mirrors ENROLMENT_PHOTOS in app/protection.py, which owns the template and re-checks the count.
export const ENROLMENT_PHOTOS = 5;

/** Multipart `image` field, capped at MAX_IMAGE_BYTES while streaming (413 beyond it). */
export const ImageUpload = () =>
  FileInterceptor('image', { limits: { fileSize: MAX_IMAGE_BYTES, files: 1 } });

/** Repeated multipart `images` field for enrolment: ENROLMENT_PHOTOS photos, each capped. */
export const EnrolmentUpload = () =>
  FilesInterceptor('images', ENROLMENT_PHOTOS, {
    limits: { fileSize: MAX_IMAGE_BYTES, files: ENROLMENT_PHOTOS },
  });

// Sniff the bytes: the client-supplied mimetype and filename are not trustworthy.
function isAllowedImage(buf: Buffer): boolean {
  const isJpeg =
    buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const isPng =
    buf.length > 8 &&
    buf
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp =
    buf.length > 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP';
  return isJpeg || isPng || isWebp;
}

@Injectable()
export class ImageFilePipe implements PipeTransform<
  Express.Multer.File | undefined,
  Buffer
> {
  transform(file: Express.Multer.File | undefined): Buffer {
    if (!file?.buffer?.length) {
      throw new BadRequestException('An `image` file is required');
    }
    if (!isAllowedImage(file.buffer)) {
      throw new UnsupportedMediaTypeException(
        'Image must be JPEG, PNG or WebP',
      );
    }
    return file.buffer;
  }
}

/** As ImageFilePipe, but the `image` may be left out. */
@Injectable()
export class OptionalImageFilePipe implements PipeTransform<
  Express.Multer.File | undefined,
  Buffer | undefined
> {
  private readonly single = new ImageFilePipe();

  transform(file: Express.Multer.File | undefined): Buffer | undefined {
    return file ? this.single.transform(file) : undefined;
  }
}

@Injectable()
export class EnrolmentImagesPipe implements PipeTransform<
  Express.Multer.File[] | undefined,
  Buffer[]
> {
  private readonly single = new ImageFilePipe();

  transform(files: Express.Multer.File[] | undefined): Buffer[] {
    if (files?.length !== ENROLMENT_PHOTOS) {
      throw new BadRequestException(
        `Enrolment needs exactly ${ENROLMENT_PHOTOS} \`images\` (got ${files?.length ?? 0})`,
      );
    }
    const images = files.map((f) => this.single.transform(f));
    // The same photo sent five times averages to nothing; that would quietly cost accuracy.
    const hashes = images.map((b) =>
      createHash('sha256').update(b).digest('hex'),
    );
    if (new Set(hashes).size !== images.length) {
      throw new BadRequestException(
        'Enrolment photos must be different captures, not copies of one photo',
      );
    }
    return images;
  }
}
