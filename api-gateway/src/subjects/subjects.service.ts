import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/db.module';
import * as schema from '../db/schema';
import { MlService, Verification } from '../ml/ml.service';

type Db = NodePgDatabase<typeof schema>;
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

export interface ConsentInput {
  /** How consent was captured, e.g. 'api' (developer attests) or 'self-enrollment'. */
  method: string;
  /** The developer's own pointer to their consent record, if any. */
  reference?: string;
}

/**
 * Enrolled people, scoped to the developer who enrolled them. Matching is always 1:1
 * against one (developer, externalId) template — never a search across templates.
 */
@Injectable()
export class SubjectsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Db,
    private readonly ml: MlService,
  ) {}

  async enroll(
    developerId: string,
    externalId: string,
    image: Buffer,
    consent: ConsentInput,
  ) {
    const embedding = await this.ml.vectorize(image);
    return this.db.transaction((tx) =>
      this.store(tx, developerId, externalId, embedding, consent),
    );
  }

  /** Consent row first, then the embedding that references it (enforced by FK). Re-enrolling replaces the template. */
  async store(
    tx: Tx,
    developerId: string,
    externalId: string,
    embedding: number[],
    consent: ConsentInput,
  ) {
    const [subject] = await tx
      .insert(schema.subjects)
      .values({ developerId, externalId })
      .onConflictDoUpdate({
        target: [schema.subjects.developerId, schema.subjects.externalId],
        set: { externalId },
      })
      .returning({ id: schema.subjects.id });

    const [consentRow] = await tx
      .insert(schema.consents)
      .values({
        subjectId: subject.id,
        method: consent.method,
        reference: consent.reference,
      })
      .returning();

    await tx
      .insert(schema.biometrics)
      .values({ subjectId: subject.id, consentId: consentRow.id, embedding })
      .onConflictDoUpdate({
        target: schema.biometrics.subjectId,
        set: { consentId: consentRow.id, embedding, createdAt: new Date() },
      });

    return {
      externalId,
      consentId: consentRow.id,
      consentGrantedAt: consentRow.grantedAt,
    };
  }

  async verify(
    developerId: string,
    externalId: string,
    image: Buffer,
  ): Promise<Verification> {
    const [template] = await this.db
      .select({ embedding: schema.biometrics.embedding })
      .from(schema.biometrics)
      .innerJoin(
        schema.subjects,
        eq(schema.biometrics.subjectId, schema.subjects.id),
      )
      .where(this.owned(developerId, externalId))
      .limit(1);

    if (!template) {
      throw new NotFoundException('Subject is not enrolled');
    }
    return this.ml.verify(image, template.embedding);
  }

  /** Right to be forgotten: removes the subject, their template and consent records. */
  async remove(developerId: string, externalId: string): Promise<void> {
    const deleted = await this.db
      .delete(schema.subjects)
      .where(this.owned(developerId, externalId))
      .returning({ id: schema.subjects.id });

    if (deleted.length === 0) {
      throw new NotFoundException('Subject not found');
    }
  }

  private owned(developerId: string, externalId: string) {
    return and(
      eq(schema.subjects.developerId, developerId),
      eq(schema.subjects.externalId, externalId),
    );
  }
}
