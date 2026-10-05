import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, sql } from 'drizzle-orm';
import { createHash } from 'crypto';
import { DRIZZLE } from '../db/db.module';
import * as schema from '../db/schema';
import { SubjectsService } from '../subjects/subjects.service';
import { assess, RiskReason } from './risk.rules';

export interface PaymentInput {
  amount: number;
  payee: string;
  deviceId: string;
}

export type PaymentResult =
  | { status: 'face_required'; reasons: RiskReason[] }
  | { status: 'declined'; reasons: RiskReason[] }
  | {
      status: 'approved';
      reasons: RiskReason[];
      faceVerified: boolean;
      transactionId: string;
    };

const sha256 = (value: string) => createHash('sha256').update(value).digest();

/**
 * Mock payment API with a risk engine in front: the rules decide whether this payment needs a
 * face check, and the selfie (if one is needed) is verified 1:1 in the same request, so a
 * verification can't be replayed onto a different payment.
 */
@Injectable()
export class TransactionsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
    private readonly subjects: SubjectsService,
  ) {}

  async pay(
    developerId: string,
    externalId: string,
    payment: PaymentInput,
    image?: Buffer,
  ): Promise<PaymentResult> {
    const t = schema.transactions;
    const [subject] = await this.db
      .select({ id: schema.subjects.id })
      .from(schema.subjects)
      .where(
        and(
          eq(schema.subjects.developerId, developerId),
          eq(schema.subjects.externalId, externalId),
        ),
      )
      .limit(1);
    if (!subject) {
      throw new NotFoundException('Subject is not enrolled');
    }

    const payeeHash = sha256(payment.payee);
    const deviceHash = sha256(payment.deviceId);
    const [seen] = await this.db
      .select({
        payee: sql<boolean>`coalesce(bool_or(${eq(t.payeeHash, payeeHash)}), false)`,
        device: sql<boolean>`coalesce(bool_or(${eq(t.deviceHash, deviceHash)}), false)`,
      })
      .from(t)
      .where(eq(t.subjectId, subject.id));

    const reasons = assess({
      amount: payment.amount,
      isNewPayee: !seen.payee,
      isNewDevice: !seen.device,
    });

    // An image sent when no check is needed is ignored: the rules decide, not the client.
    const faceVerified = reasons.length > 0;
    if (faceVerified) {
      if (!image) return { status: 'face_required', reasons };
      const { match } = await this.subjects.verify(
        developerId,
        externalId,
        image,
      );
      if (!match) return { status: 'declined', reasons };
    }

    const [row] = await this.db
      .insert(t)
      .values({
        subjectId: subject.id,
        amount: payment.amount,
        payeeHash,
        deviceHash,
        faceVerified,
      })
      .returning({ id: t.id });
    return {
      status: 'approved',
      reasons,
      faceVerified,
      transactionId: row.id,
    };
  }
}
