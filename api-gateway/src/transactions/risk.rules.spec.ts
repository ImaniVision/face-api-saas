import { AMOUNT_LIMIT, assess } from './risk.rules';

const known = { isNewPayee: false, isNewDevice: false };

describe('assess', () => {
  it('lets a small payment to a known payee from a known device through', () => {
    expect(assess({ amount: AMOUNT_LIMIT - 1, ...known })).toEqual([]);
  });

  it('requires a face at the amount limit, not only above it', () => {
    expect(assess({ amount: AMOUNT_LIMIT, ...known })).toEqual([
      'amount_over_limit',
    ]);
    expect(assess({ amount: AMOUNT_LIMIT + 1, ...known })).toEqual([
      'amount_over_limit',
    ]);
  });

  it('requires a face for a new payee or a new device, and reports every reason', () => {
    expect(assess({ amount: 1, isNewPayee: true, isNewDevice: false })).toEqual(
      ['new_payee'],
    );
    expect(assess({ amount: 1, isNewPayee: false, isNewDevice: true })).toEqual(
      ['new_device'],
    );
    expect(
      assess({ amount: AMOUNT_LIMIT, isNewPayee: true, isNewDevice: true }),
    ).toEqual(['amount_over_limit', 'new_payee', 'new_device']);
  });
});
