import { NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { SubjectsService } from '../subjects/subjects.service';
import { AMOUNT_LIMIT } from './risk.rules';
import { TransactionsService } from './transactions.service';

function setup({
  enrolled = true,
  seen = { payee: true, device: true },
  match = true,
} = {}) {
  // Only the query chains pay() touches: subject lookup, then payee/device history.
  const lookups = [enrolled ? [{ id: 'subject-1' }] : [], [seen]];
  const select = () => {
    const rows = lookups.shift();
    const where = () =>
      Object.assign(Promise.resolve(rows), { limit: () => rows });
    return { from: () => ({ where }) };
  };
  const values = jest.fn(() => ({
    returning: () => Promise.resolve([{ id: 'txn-1' }]),
  }));
  const db = {
    select,
    insert: () => ({ values }),
  } as unknown as NodePgDatabase<typeof schema>;
  const verify = jest.fn().mockResolvedValue({ match });
  const subjects = { verify } as unknown as SubjectsService;
  return { service: new TransactionsService(db, subjects), verify, values };
}

const small = { amount: 500, payee: 'mum', deviceId: 'phone-1' };
const selfie = Buffer.from('selfie');

describe('TransactionsService.pay', () => {
  it('approves a low-risk payment without a face check, ignoring any selfie sent', async () => {
    const { service, verify, values } = setup();

    await expect(service.pay('dev-1', 'alice', small, selfie)).resolves.toEqual(
      {
        status: 'approved',
        reasons: [],
        faceVerified: false,
        transactionId: 'txn-1',
      },
    );
    expect(verify).not.toHaveBeenCalled();
    expect(values).toHaveBeenCalledTimes(1);
  });

  it('asks for a face, and records nothing, when a rule fires and no selfie was sent', async () => {
    const { service, verify, values } = setup({
      seen: { payee: false, device: true },
    });

    await expect(service.pay('dev-1', 'alice', small)).resolves.toEqual({
      status: 'face_required',
      reasons: ['new_payee'],
    });
    expect(verify).not.toHaveBeenCalled();
    expect(values).not.toHaveBeenCalled();
  });

  it('verifies the selfie 1:1 and approves on a match', async () => {
    const { service, verify, values } = setup();
    const large = { ...small, amount: AMOUNT_LIMIT };

    await expect(service.pay('dev-1', 'alice', large, selfie)).resolves.toEqual(
      {
        status: 'approved',
        reasons: ['amount_over_limit'],
        faceVerified: true,
        transactionId: 'txn-1',
      },
    );
    expect(verify).toHaveBeenCalledWith('dev-1', 'alice', selfie);
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ faceVerified: true, amount: AMOUNT_LIMIT }),
    );
  });

  it('declines on no match, and the payee stays new', async () => {
    const { service, values } = setup({
      seen: { payee: false, device: false },
      match: false,
    });

    await expect(service.pay('dev-1', 'alice', small, selfie)).resolves.toEqual(
      { status: 'declined', reasons: ['new_payee', 'new_device'] },
    );
    expect(values).not.toHaveBeenCalled();
  });

  it('stores payee and device only as hashes', async () => {
    const { service, values } = setup();

    await service.pay('dev-1', 'alice', small);
    const [[row]] = values.mock.calls as unknown as [[Record<string, unknown>]];
    expect(JSON.stringify(row)).not.toContain('mum');
    expect(JSON.stringify(row)).not.toContain('phone-1');
  });

  it('404s for a subject that was never enrolled', async () => {
    const { service } = setup({ enrolled: false });

    await expect(service.pay('dev-1', 'nobody', small)).rejects.toThrow(
      NotFoundException,
    );
  });
});
