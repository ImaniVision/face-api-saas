import {
  BadRequestException,
  Injectable,
  PipeTransform,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Multipart `image` field, capped at MAX_IMAGE_BYTES while streaming (413 beyond it). */
export const ImageUpload = () =>
  FileInterceptor('image', { limits: { fileSize: MAX_IMAGE_BYTES, files: 1 } });

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
