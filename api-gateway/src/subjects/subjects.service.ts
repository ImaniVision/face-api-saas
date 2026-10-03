import {
  ConflictException,
  Inject,
  InternalServerErrorException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/db.module';
import * as schema from '../db/schema';
import { ENROLMENT_PHOTOS } from '../common/image-upload';
import {
  isTemplateVersion,
  MlService,
  ProtectedTemplate,
  Verification,
} from '../ml/ml.service';

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
    images: Buffer[],
    consent: ConsentInput,
  ) {
    const template = await this.ml.enroll(images);
    return this.db.transaction((tx) =>
      this.store(tx, developerId, externalId, template, consent),
    );
  }

  /** Consent row first, then the template that references it (enforced by FK). Re-enrolling replaces the template. */
  async store(
    tx: Tx,
    developerId: string,
    externalId: string,
    template: ProtectedTemplate,
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

    const { digest, helper, version: templateVersion } = template;
    await tx
      .insert(schema.biometrics)
      .values({
        subjectId: subject.id,
        consentId: consentRow.id,
        digest,
        helper,
        templateVersion,
      })
      .onConflictDoUpdate({
        target: schema.biometrics.subjectId,
        set: {
          consentId: consentRow.id,
          digest,
          helper,
          templateVersion,
          createdAt: new Date(),
        },
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
    const [row] = await this.db
      .select({
        digest: schema.biometrics.digest,
        helper: schema.biometrics.helper,
        version: schema.biometrics.templateVersion,
      })
      .from(schema.subjects)
      .leftJoin(
        schema.biometrics,
        eq(schema.biometrics.subjectId, schema.subjects.id),
      )
      .where(this.owned(developerId, externalId))
      .limit(1);

    if (!row) {
      throw new NotFoundException('Subject is not enrolled');
    }
    // Enrolment writes subject + template in one transaction, so a subject without a template
    // only exists because the M2 upgrade dropped its unprotected embedding.
    if (!row.digest || !row.helper || row.version === null) {
      throw new ConflictException(
        `Subject must re-enroll with ${ENROLMENT_PHOTOS} photos (templates were upgraded to a protected format)`,
      );
    }
    if (!isTemplateVersion(row.version)) {
      throw new InternalServerErrorException(
        'Stored template has an unknown format',
      );
    }
    return this.ml.verify(image, {
      digest: row.digest,
      helper: row.helper,
      version: row.version,
    });
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
