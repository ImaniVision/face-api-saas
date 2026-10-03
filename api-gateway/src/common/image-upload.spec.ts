import {
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import {
  ENROLMENT_PHOTOS,
  EnrolmentImagesPipe,
  ImageFilePipe,
} from './image-upload';

const file = (bytes: number[] | Buffer) =>
  ({ buffer: Buffer.from(bytes) }) as Express.Multer.File;

const jpeg = (n: number) => file([0xff, 0xd8, 0xff, 0xe0, n]);

describe('EnrolmentImagesPipe', () => {
  const pipe = new EnrolmentImagesPipe();
  const photos = (n: number) => Array.from({ length: n }, (_, i) => jpeg(i));

  it(`accepts exactly ${ENROLMENT_PHOTOS} distinct images`, () => {
    expect(pipe.transform(photos(ENROLMENT_PHOTOS))).toHaveLength(
      ENROLMENT_PHOTOS,
    );
  });

  it('rejects too few, too many or none', () => {
    for (const files of [
      undefined,
      [],
      photos(ENROLMENT_PHOTOS - 1),
      photos(ENROLMENT_PHOTOS + 1),
    ]) {
      expect(() => pipe.transform(files)).toThrow(BadRequestException);
    }
  });

  it('rejects the same photo sent more than once', () => {
    const files = [...photos(ENROLMENT_PHOTOS - 1), jpeg(0)];
    expect(() => pipe.transform(files)).toThrow(/different captures/);
  });

  it('rejects a non-image among the photos', () => {
    const files = [...photos(ENROLMENT_PHOTOS - 1), file(Buffer.from('%PDF'))];
    expect(() => pipe.transform(files)).toThrow(UnsupportedMediaTypeException);
  });
});

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
