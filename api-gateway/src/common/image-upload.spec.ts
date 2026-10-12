import {
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ImageFilePipe } from './image-upload';

const file = (bytes: number[] | Buffer) =>
  ({ buffer: Buffer.from(bytes) }) as Express.Multer.File;

describe('ImageFilePipe', () => {
  const pipe = new ImageFilePipe();

  it('accepts JPEG, PNG and WebP by magic bytes', () => {
    const jpeg = [0xff, 0xd8, 0xff, 0xe0, 0, 0];
    const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0];
    const webp = Buffer.concat([
      Buffer.from('RIFF'),
      Buffer.alloc(4),
      Buffer.from('WEBPVP8 '),
    ]);
    for (const bytes of [jpeg, png, webp]) {
      expect(pipe.transform(file(bytes))).toBeInstanceOf(Buffer);
    }
  });

  it('rejects a missing or empty file', () => {
    expect(() => pipe.transform(undefined)).toThrow(BadRequestException);
    expect(() => pipe.transform(file([]))).toThrow(BadRequestException);
  });

  it('rejects non-images regardless of claimed type', () => {
    const pdfCalledJpeg = {
      buffer: Buffer.from('%PDF-1.7 ...'),
      mimetype: 'image/jpeg',
      originalname: 'face.jpg',
    } as Express.Multer.File;
    expect(() => pipe.transform(pdfCalledJpeg)).toThrow(
      UnsupportedMediaTypeException,
    );
  });
});
