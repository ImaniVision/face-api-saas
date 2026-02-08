import { pgTable, uuid, text, timestamp, vector } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const biometrics = pgTable('biometrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  embedding: vector('embedding', { dimensions: 512 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
