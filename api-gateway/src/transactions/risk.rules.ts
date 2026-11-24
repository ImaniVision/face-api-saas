/** Payments at or above this (minor units: 100000 = 1,000.00) need a face check. */
export const AMOUNT_LIMIT = 100_000;

export type RiskReason = 'amount_over_limit' | 'new_payee' | 'new_device';

export interface RiskInput {
  amount: number;
  isNewPayee: boolean;
  isNewDevice: boolean;
}

/** Why this payment needs a face check; empty means it can go through without one. */
export function assess({
  amount,
  isNewPayee,
  isNewDevice,
}: RiskInput): RiskReason[] {
  const reasons: RiskReason[] = [];
  if (amount >= AMOUNT_LIMIT) reasons.push('amount_over_limit');
  if (isNewPayee) reasons.push('new_payee');
  if (isNewDevice) reasons.push('new_device');
  return reasons;
}
