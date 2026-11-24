import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
  smallint,
  index,
  unique,
  customType,
} from 'drizzle-orm/pg-core';

const bytea = customType<{ data: Buffer }>({ dataType: () => 'bytea' });

// Developers (portal accounts). `password` is null for face-only demo accounts.
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password'),
  emailVerifiedAt: timestamp('email_verified_at'),
  emailVerificationTokenHash: text('email_verification_token_hash'),
  emailVerificationExpiresAt: timestamp('email_verification_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// A person enrolled by a developer, identified by the developer's own id for them.
export const subjects = pgTable(
  'subjects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    developerId: uuid('developer_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    externalId: text('external_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [unique().on(t.developerId, t.externalId)],
);

export const consents = pgTable('consents', {
  id: uuid('id').defaultRandom().primaryKey(),
  subjectId: uuid('subject_id')
    .references(() => subjects.id, { onDelete: 'cascade' })
    .notNull(),
  method: text('method').notNull(),
  reference: text('reference'),
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
});

// consent_id NOT NULL: the database itself refuses a template without a consent record.
// Cancelable (IronMask) template: digest + helper never reveal the face; no raw embedding is stored.
export const biometrics = pgTable('biometrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  subjectId: uuid('subject_id')
    .references(() => subjects.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  consentId: uuid('consent_id')
    .references(() => consents.id, { onDelete: 'cascade' })
    .notNull(),
  digest: bytea('digest').notNull(),
  helper: bytea('helper').notNull(),
  // Layout of `helper`: 1 = fp32 (1 MiB), 2 = int8 (257 KiB). Rows of both can coexist.
  templateVersion: smallint('template_version').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  prefix: varchar('prefix', { length: 12 }).notNull(),
  hashedKey: text('hashed_key').notNull(),
  lastFour: varchar('last_four', { length: 4 }).notNull(),
  scopes: text('scopes').array().default(['all']),
  isRevoked: boolean('is_revoked').default(false).notNull(),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// One row per metered /v1 call; billing (future work) reads from here.
export const apiUsage = pgTable(
  'api_usage',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    apiKeyId: uuid('api_key_id').references(() => apiKeys.id, {
      onDelete: 'set null',
    }),
    endpoint: text('endpoint').notNull(),
    statusCode: integer('status_code').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('api_usage_user_created_idx').on(t.userId, t.createdAt)],
);

// Approved payments only: the history the risk engine reads to spot a new payee or device.
// Payee and device are the developer's own strings, kept only as SHA-256 hashes.
export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    subjectId: uuid('subject_id')
      .references(() => subjects.id, { onDelete: 'cascade' })
      .notNull(),
    amount: integer('amount').notNull(),
    payeeHash: bytea('payee_hash').notNull(),
    deviceHash: bytea('device_hash').notNull(),
    faceVerified: boolean('face_verified').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('transactions_subject_idx').on(t.subjectId)],
);
