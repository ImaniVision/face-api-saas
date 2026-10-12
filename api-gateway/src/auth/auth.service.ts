import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
  Inject,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, gt } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DRIZZLE } from '../db/db.module';
import * as schema from '../db/schema';
import { MlService } from '../ml/ml.service';
import { SubjectsService } from '../subjects/subjects.service';
import { MailService } from './mail.service';

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
// Face-login demo accounts enroll themselves as their own subject under this id.
const SELF_SUBJECT = 'self';

const sha256 = (value: string) =>
  crypto.createHash('sha256').update(value).digest('hex');

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
    private ml: MlService,
    private subjects: SubjectsService,
    private mail: MailService,
  ) {}

  async emailRegister(email: string, password: string) {
    await this.assertEmailFree(email);

    const token = crypto.randomBytes(32).toString('base64url');
    const [user] = await this.db
      .insert(schema.users)
      .values({
        email,
        password: await bcrypt.hash(password, 10),
        emailVerificationTokenHash: sha256(token),
        emailVerificationExpiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
      })
      .returning({ id: schema.users.id });

    try {
      await this.mail.sendVerification(email, token);
    } catch (err) {
      // Don't leave an account nobody can verify.
      await this.db.delete(schema.users).where(eq(schema.users.id, user.id));
      this.logger.error(`Verification email failed: ${String(err)}`);
      throw new ServiceUnavailableException(
        'Could not send the verification email. Please try again.',
      );
    }

    return { message: 'Check your email to verify your account.' };
  }

  async verifyEmail(token: string) {
    const [user] = await this.db
      .update(schema.users)
      .set({
        emailVerifiedAt: new Date(),
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
      })
      .where(
        and(
          eq(schema.users.emailVerificationTokenHash, sha256(token)),
          gt(schema.users.emailVerificationExpiresAt, new Date()),
        ),
      )
      .returning({ id: schema.users.id });

    if (!user) {
      throw new BadRequestException(
        'Verification link is invalid or has expired.',
      );
    }
    return { verified: true };
  }

  async emailLogin(email: string, password: string) {
    const user = await this.findByEmail(email);

    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      ...this.generateToken(user.id, user.email),
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerifiedAt !== null,
      },
    };
  }

  /** Face-login demo: a password-less account enrolled as its own subject. */
  async register(email: string, image: Buffer) {
    await this.assertEmailFree(email);
    const embedding = await this.ml.vectorize(image);

    const user = await this.db.transaction(async (tx) => {
      const [created] = await tx
        .insert(schema.users)
        .values({ email })
        .returning();
      await this.subjects.store(tx, created.id, SELF_SUBJECT, embedding, {
        method: 'self-enrollment',
      });
      return created;
    });

    return this.generateToken(user.id, user.email);
  }

  /** 1:1: identity is claimed by email first, then the face is checked against that one template. */
  async login(email: string, image: Buffer) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const result = await this.subjects
      .verify(user.id, SELF_SUBJECT, image)
      .catch((err: unknown) => {
        if (err instanceof NotFoundException) {
          throw new UnauthorizedException('Invalid credentials');
        }
        throw err;
      });

    if (!result.match) {
      throw new UnauthorizedException('Biometric verification failed');
    }
    return this.generateToken(user.id, user.email);
  }

  /** Right to be forgotten for the developer: cascades to keys, subjects, templates, consents and usage. */
  async deleteAccount(userId: string): Promise<void> {
    await this.db.delete(schema.users).where(eq(schema.users.id, userId));
  }

  private findByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
  }

  private async assertEmailFree(email: string) {
    if (await this.findByEmail(email)) {
      throw new ConflictException('User already exists');
    }
  }

  private generateToken(userId: string, email: string) {
    return {
      access_token: this.jwtService.sign({ sub: userId, email }),
    };
  }
}
