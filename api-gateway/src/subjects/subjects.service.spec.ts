import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { MlService } from '../ml/ml.service';
import { SubjectsService } from './subjects.service';

type Row = {
  digest: Buffer | null;
  helper: Buffer | null;
  version: number | null;
};

function setup(rows: Row[]) {
  const limit = jest.fn().mockResolvedValue(rows);
  // Only the query chain verify() touches.
  const chain = {
    from: () => chain,
    leftJoin: () => chain,
    where: () => ({ limit }),
  };
  const db = { select: () => chain } as unknown as NodePgDatabase<
    typeof schema
  >;
  const verify = jest.fn().mockResolvedValue({ match: true });
  const ml = { verify } as unknown as MlService;
  return { service: new SubjectsService(db, ml), verify };
}

const image = Buffer.from('selfie');

describe('SubjectsService.verify', () => {
  it('sends the stored protected template, with its format version, to the ML service', async () => {
    const digest = Buffer.alloc(32, 1);
    const helper = Buffer.alloc(16, 2);
    const { service, verify } = setup([{ digest, helper, version: 2 }]);

    await expect(service.verify('dev-1', 'alice', image)).resolves.toEqual({
      match: true,
    });
    expect(verify).toHaveBeenCalledWith(image, { digest, helper, version: 2 });
  });

  it('refuses a stored template in an unknown format instead of guessing', async () => {
    const row = {
      digest: Buffer.alloc(32),
      helper: Buffer.alloc(16),
      version: 9,
    };
    const { service, verify } = setup([row]);

    await expect(service.verify('dev-1', 'alice', image)).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(verify).not.toHaveBeenCalled();
  });

  it('404s for a subject that was never enrolled', async () => {
    const { service, verify } = setup([]);

    await expect(service.verify('dev-1', 'nobody', image)).rejects.toThrow(
      NotFoundException,
    );
    expect(verify).not.toHaveBeenCalled();
  });

  it('409s, asking for re-enrolment, when only a pre-M2 subject remains', async () => {
    const { service, verify } = setup([
      { digest: null, helper: null, version: null },
    ]);

    await expect(service.verify('dev-1', 'alice', image)).rejects.toThrow(
      ConflictException,
    );
    await expect(service.verify('dev-1', 'alice', image)).rejects.toThrow(
      /re-enroll with 5 photos/,
    );
    expect(verify).not.toHaveBeenCalled();
  });
});
